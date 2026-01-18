import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = userSchema.parse(body);

        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { user: null, message: "User with this email already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 10);
        const newUser = await db.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
            },
        });

        // Don't restart passwordHash
        const { passwordHash: _, ...rest } = newUser;

        return NextResponse.json(
            { user: rest, message: "User created successfully" },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: (error as any).errors[0].message }, { status: 400 });
        }
        console.error("Registration Error:", error);
        return NextResponse.json(
            { message: "Something went wrong: " + (error as Error).message },
            { status: 500 }
        );
    }
}
