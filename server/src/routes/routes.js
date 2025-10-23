import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // da li postoji isti
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // hash pass
        const hashedPassword = await bcrypt.hash(password, 10);

        // napravi korisnika
        const user = await prisma.user.create({
            data: {
                email,
                fullName,
                password: hashedPassword,
                role: "event creator",
                status: false,
            },
        });

        res.json({ success: true, message: "User registered successfully", user });
    } catch (err) {
        res.status(500).json({ error: "Registration failed" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // da li postoji
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // proveri pass
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { status: true }
        });

        // token
        const token = jwt.sign(
            { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// LOGOUT
router.post("/logout", async (req, res) => {
    const { userId } = req.body;
    try {

        await prisma.user.update({
            where: { id: userId },
            data: { status: false }
        });

        res.json({
            success: true,
            message: "Logout successful"
        });
    } catch (err) {
        res.status(500).json({ error: "Logout failed" });
    }
});

// GET svi eventovi
router.get("/", async (req, res) => {
    try {
        let { page, limit } = req.query;

        // default vrednosti
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        const skip = (page - 1) * limit;

        // ukupan broj eventova
        const total = await prisma.event.count();

        // sortirano po datumu kreiranja DESC
        const events = await prisma.event.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                author: { select: { fullName: true } },
                category: { select: { name: true } },
                tags: {
                    include: { tag: true }
                }
            }
        });

        res.json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit,
            data: events
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// GET jedan event 
router.get("/event/:id", async (req, res) => {
    try {
        const event = await prisma.event.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                author: { select: { fullName: true } },
                category: true,
                tags: { include: { tag: true } },
                comments: true,
            },
        });

        if (!event) return res.status(404).json({ error: "Event not found" });

        res.json(event);
    } catch (error) {
        res.status(500).json({ error: "Error trying to get event" });
    }
});

// POST novi event
router.post("/", async (req, res) => {
    try {
        const { title, description, eventDate, location, authorId, categoryId, tags } = req.body;

        // validacija
        if (!title || !description || !eventDate || !location || !categoryId || !authorId) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // kreiranje eventa
        const newEvent = await prisma.event.create({
            data: {
                title,
                description,
                eventDate: new Date(eventDate),
                location,
                authorId: parseInt(authorId),
                categoryId: parseInt(categoryId),
                // maxCapacity,
                tags: {
                    create: tags
                        ? tags.split(",").map((t) => ({
                            tag: { connectOrCreate: { where: { name: t.trim() }, create: { name: t.trim() } } },
                        }))
                        : [],
                },
            },
        });

        res.status(201).json(newEvent);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error creating event" });
    }
});

// GET jedan event po ID
router.get("/:id", async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                author: true,
                category: true,
                tags: {
                    include: { tag: true }
                },
                comments: true,
                eventViews: true,
                reactions: true
            },
        });

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error trying to get event" });
    }
});

// PUT izmena eventa
router.put("/:id", async (req, res) => {
    try {
        const { title, description, eventDate, location, categoryId, tags, maxCapacity } = req.body;

        const updatedEvent = await prisma.event.update({
            where: { id: parseInt(req.params.id) },
            data: {
                title,
                description,
                eventDate: new Date(eventDate),
                location,
                categoryId,
                maxCapacity,
                tags: {
                    deleteMany: {},
                    create: tags
                        ? tags.split(",").map((t) => ({
                            tag: { connectOrCreate: { where: { name: t.trim() }, create: { name: t.trim() } } },
                        }))
                        : [],
                },
            },
        });

        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ error: "Error trying to edit event" });
    }
});

// DELETE event 
router.delete("/:id", async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        console.log(eventId);

        // brisi zavisne entitete pre eventa
        await prisma.comment.deleteMany({ where: { eventId } });
        await prisma.rsvp.deleteMany({ where: { eventId } });
        await prisma.eventTag.deleteMany({ where: { eventId } });
        await prisma.eventView.deleteMany({ where: { eventId } });
        await prisma.eventReaction.deleteMany({ where: { eventId } });

        await prisma.event.delete({ where: { id: eventId } });

        res.json({ message: "Event deleted" });
    } catch (error) {
        res.status(500).json({ error: "Error trying to delete event" });
    }
});

// update views
router.post("/event/:id/view", async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);

        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "Not logged in" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // upsert EventView, napravi ili ignorisi ako vec postoji
        await prisma.eventView.upsert({
            where: { eventId_userId: { eventId, userId } },
            update: {},
            create: { eventId, userId }
        });

        // views++ samo ako nije bilo existing viewa
        const count = await prisma.eventView.count({
            where: { eventId, userId }
        });

        if (count === 1) {
            await prisma.event.update({
                where: { id: eventId },
                data: { views: { increment: 1 } },
            });
        }

        res.json({ success: true, message: "View counted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error while counting views" });
    }
});

//dodavanje komentara
router.post("/event/:id/comment", async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { authorName, text } = req.body;

        if (!authorName || !text) {
            return res.status(400).json({ error: "Fields authorName and text su obavezna" });
        }

        const comment = await prisma.comment.create({
            data: {
                authorName,
                text,
                eventId,
            },
        });

        res.json({ success: true, comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error trying to add comment" });
    }
});

//like i dislike eventa
router.post("/event/:id/reaction", async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { type } = req.body; // l or dl

        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "Not logged in" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // da li ima reakciju
        const existing = await prisma.eventReaction.findUnique({
            where: { userId_eventId: { userId, eventId } },
        });

        if (existing) {
            if (existing.type === type) {
                return res.status(400).json({ error: "You already voted for this" });
            }

            // ako korisnik menja tip, update reakciju i inc/dec
            await prisma.eventReaction.update({
                where: { id: existing.id },
                data: { type }
            });

            if (type === "LIKE") {
                await prisma.event.update({
                    where: { id: eventId },
                    data: { likes: { increment: 1 }, dislikes: { decrement: 1 } }
                });
            } else {
                await prisma.event.update({
                    where: { id: eventId },
                    data: { likes: { decrement: 1 }, dislikes: { increment: 1 } }
                });
            }
        } else {
            // kreiraj novu reakciju
            await prisma.eventReaction.create({
                data: { userId, eventId, type }
            });

            // inc like/dislike
            if (type === "LIKE") {
                await prisma.event.update({
                    where: { id: eventId },
                    data: { likes: { increment: 1 } }
                });
            } else {
                await prisma.event.update({
                    where: { id: eventId },
                    data: { dislikes: { increment: 1 } }
                });
            }
        }

        // vrati updated vrednosti
        const updatedEvent = await prisma.event.findUnique({
            where: { id: eventId },
            select: { likes: true, dislikes: true }
        });

        res.json({ success: true, likes: updatedEvent.likes, dislikes: updatedEvent.dislikes });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error trying to like/dislike event" });
    }
});

//like i dislike komentara
router.post("/event/comment/:commentId/reaction", async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId);
        const { type } = req.body; // l or dl

        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "Not logged in" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // proveri da li korisnik vec ima reakciju
        const existing = await prisma.commentReaction.findUnique({
            where: { userId_commentId: { userId, commentId } },
        });

        if (existing) {
            return res.status(400).json({ error: "You already voted for this comment" });
        }

        // kreiraj novu reakciju
        await prisma.commentReaction.create({
            data: {
                userId,
                commentId,
                type,
            },
        });

        // opcionalno update na samom Comment tabeli
        if (type === "LIKE") {
            await prisma.comment.update({ where: { id: commentId }, data: { likes: { increment: 1 } } });
        } else if (type === "DISLIKE") {
            await prisma.comment.update({ where: { id: commentId }, data: { dislikes: { increment: 1 } } });
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error trying to like/dislike comment" });
    }
});

// GET /events/most-visited
router.get("/events/most-visited", async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const events = await prisma.event.findMany({
            where: {
                eventViews: {
                    some: {
                        createdAt: {
                            gte: thirtyDaysAgo,
                        },
                    },
                },
            },
            include: {
                category: true,
            },
            orderBy: {
                views: "desc",
            },
            take: 10,
        });

        console.log("Most visited events:", events);
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to fetch events" });
    }
});

// GET /events/search?query=tekst&page=1&limit=10
router.get("/events/search", async (req, res) => {
    try {
        const { query = "", page = 1, limit = 10 } = req.query;
        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);

        const where = {
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ],
        };

        const total = await prisma.event.count({ where });

        const events = await prisma.event.findMany({
            where,
            include: { category: true, tags: { include: { tag: true } }, author: true },
            orderBy: { createdAt: "desc" },
            skip: (pageInt - 1) * limitInt,
            take: limitInt,
        });

        res.json({
            data: events,
            total,
            page: pageInt,
            totalPages: Math.ceil(total / limitInt),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to fetch events" });
    }
});

// GET sve kategorije
router.get("/category/categories", async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        console.log(categories);
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to fetch categories" });
    }
});

//kreiraj novu kategoriju
router.post("/categories", async (req, res) => {
    try {
        const { name, description } = req.body;

        // provera da li ime postoji
        const existing = await prisma.category.findUnique({ where: { name } });
        if (existing) return res.status(400).json({ error: "Category with this name already exists" });

        const category = await prisma.category.create({
            data: { name, description }
        });
        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to create category" });
    }
});

//izmeni kategoriju
router.put("/category/categories/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, description } = req.body;

        // opciono provera duplikata imena osim trenutne kategorije
        const existing = await prisma.category.findFirst({
            where: { name, NOT: { id } }
        });
        if (existing) return res.status(400).json({ error: "Category with this name already exists" });

        const updated = await prisma.category.update({
            where: { id },
            data: { name, description }
        });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to edit category" });
    }
});

//obrisi kategoriju
router.delete("/categories/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // provera da li kategorija ima eventove
        const category = await prisma.category.findUnique({
            where: { id },
            include: { events: true }
        });

        if (category.events.length > 0) {
            return res.status(400).json({ error: "You cannot delete category that has events" });
        }

        await prisma.category.delete({ where: { id } });
        res.json({ message: "Category deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to delete category" });
    }
});

//svi eventovi iz kategorije
router.get("/categories/:id/events", async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        const events = await prisma.event.findMany({
            where: { categoryId },
            include: { author: true, category: true }
        });
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to fetch all events from category" });
    }
});

// GET jedna kategorija po id
router.get("/categories/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

        const category = await prisma.category.findUnique({
            where: { id }
        });

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to fetch category" });
    }
});

// GET detalji jednog eventa
router.get("/event/:id", async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        if (isNaN(eventId)) return res.status(400).json({ error: "Invalid event ID" });

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                author: true,
                category: true,
                tags: {
                    include: {
                        tag: true,
                    },
                },
                comments: true,
                eventViews: true,
                reactions: true,
            },
        });

        if (!event) return res.status(404).json({ error: "Event not found" });

        res.json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to fetch event" });
    }
});

//slicni dogadjaji
router.get("/events/related", async (req, res) => {
    try {
        const { tags, excludeId } = req.query;
        if (!tags) return res.json([]);

        const tagArray = tags.split(",");
        const events = await prisma.event.findMany({
            where: {
                tags: {
                    some: { tag: { name: { in: tagArray } } }
                },
                NOT: { id: parseInt(excludeId) }
            },
            include: { tags: { include: { tag: true } } },
            orderBy: { createdAt: "desc" },
            take: 3
        });
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to fetch similar events" });
    }
});

// GET /api/auth/events/by-tag/:tagName
router.get("/events/by-tag/:tagName", async (req, res) => {
    const { tagName } = req.params;

    try {
        const events = await prisma.event.findMany({
            where: {
                tags: {
                    some: {
                        tag: {
                            name: tagName
                        }
                    }
                }
            },
            include: {
                category: true,
                author: true,
                tags: {
                    include: {
                        tag: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to fetch events with same tag" });
    }
});

// GET /api/auth/events/top-reacted
router.get("/events/top-reacted", async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            include: { author: true, category: true },
        });

        // sortiraj po reakcijama suma
        const sorted = events.sort((a, b) => (b.likes + b.dislikes) - (a.likes + a.dislikes));

        res.json(sorted.slice(0, 3));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to fetch top reacted events" });
    }
});

// GET /api/users 
router.get("/admin/users", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
            }
        });
        console.log("Users from DB:", users);
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// kreiraj novog usera
router.post("/admin/users", async (req, res) => {
    const { fullName, email, role, password } = req.body;

    if (!fullName || !email || !role || !password) {
        return res.status(400).json({ error: "All fields required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { fullName, email, role, password: hashedPassword },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
            },
        });
        res.json({ success: true, user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error creating user" });
    }
});

// edit usera
router.put("/admin/users/:id", async (req, res) => {
    const { id } = req.params;
    const { fullName, email, role, password } = req.body;

    try {
        const updateData = { fullName, email, role };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: updateData,
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
            },
        });

        res.json({ success: true, user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to edit user" });
    }
});

// delete user
router.delete("/admin/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.user.delete({ where: { id: Number(id) } });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error trying to delete user" });
    }
});

// GET /api/auth/admin/users/:id
router.get("/admin/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;