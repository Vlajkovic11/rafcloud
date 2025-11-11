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
                            // errors: true, 
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
            machines = []; // fallback
        }

        res.json(machines);
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: "Failed to fetch machines" });
    }
};

export const createMachine = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const newMachine = await prisma.machine.create({
            data: {
                name,
                state: "Off", // default state
                createdById: userId,
            },
        });

        res.json(newMachine);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create machine" });
    }
};

export const getMachineById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const machine = await prisma.machine.findUnique({
            where: { id },
            include: { createdBy: true, errors: true },
        });

        if (!machine) return res.status(404).json({ error: "Machine not found" });
        res.json(machine);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch machine" });
    }
};

// Turn On
export const turnOn = async (req, res) => {
    try {
        const { id } = req.params;

        const machine = await prisma.machine.update({
            where: { id: parseInt(id) },
            data: { state: "On" },
        });

        const newError = await prisma.errorLog.create({
            data: {
                message: "Error while turning on",
                machineId: parseInt(id),
            },
        });

        res.json({ message: "Machine turned on", machine, error: newError });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to turn on machine" });
    }
};

// Turn Off
export const turnOff = async (req, res) => {
    try {
        const { id } = req.params;

        const machine = await prisma.machine.update({
            where: { id: parseInt(id) },
            data: { state: "Off" },
        });

        const newError = await prisma.errorLog.create({
            data: {
                message: "Error while turning off",
                machineId: parseInt(id),
            },
        });

        res.json({ message: "Machine turned off", machine, error: newError });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to turn off machine" });
    }
};

// Restart
export const restart = async (req, res) => {
    try {
        const { id } = req.params;
        const newError = await prisma.errorLog.create({
            data: {
                message: "Error while restarting",
                machineId: parseInt(id),
            },
        });
        res.json({ message: "Error logged for restarting", error: newError });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to log error" });
    }
};

// Destroy
export const destroy = async (req, res) => {
    try {
        const { id } = req.params;

        const machine = await prisma.machine.update({
            where: { id: parseInt(id) },
            data: { active: false },
        });

        const newError = await prisma.errorLog.create({
            data: {
                message: "Error while destroying",
                machineId: parseInt(id),
            },
        });

        res.json({ message: "Machine destroyed", machine, error: newError });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to destroy machine" });
    }
};