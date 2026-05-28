import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';
const JWT_EXPIRES_IN = '7d';

function generateToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().optional(),
});

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: 'E-mail ou senha incorretos' });
    return;
  }

  const token = generateToken(user.id);
  res.json({
    tokens: { accessToken: token, refreshToken: token },
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt },
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten() });
    return;
  }

  const { name, email, password, phone } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    res.status(409).json({ message: 'E-mail já cadastrado' });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone },
  });

  const token = generateToken(user.id);
  res.status(201).json({
    tokens: { accessToken: token, refreshToken: token },
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt },
  });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, phone: true, avatar: true, createdAt: true },
  });
  if (!user) {
    res.status(404).json({ message: 'Usuário não encontrado' });
    return;
  }
  res.json(user);
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // JWT é stateless; o cliente descarta o token
  res.status(204).send();
}
