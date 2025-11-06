import prisma from "../prismaClient.js";

export const getMachines = async (req, res) => {
    try {
        const userEmail = req.user.email;
        let machines = [];

        try {
            if (userEmail === "admin@rafcloud") {
                try {
                    machines = await prisma.machine.findMany({
                        include: {
                            createdBy: { select: { id: true, fullName: true, email: true } },
                            // errors: true, // možeš testirati da li ovo pravi problem
                        },
                    });
                } catch (err) {
                    console.error("Prisma error (admin fetch):", err);
                    machines = [];
                }
            } else {
                machines = await prisma.machine.findMany({
                    where: { createdById: req.user.id },
                    include: {
                        createdBy: { select: { id: true, fullName: true, email: true } },
                        // errors: true,
                    },
                });
            }
        } catch (prismaErr) {
            console.error("Prisma error:", prismaErr);
            machines = []; // fallback da server ne padne
        }

        res.json(machines);
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: "Failed to fetch machines" });
    }
};

export const createMachine = async (req, res) => {
    try {
        const { name } = req.body; // samo name
        const userId = req.user.id; // iz tokena

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const newMachine = await prisma.machine.create({
            data: {
                name,
                state: "Free", // default state
                createdById: userId,
            },
        });

        res.json(newMachine);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create machine" });
    }
};

