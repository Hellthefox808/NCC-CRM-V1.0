import { Request, Response } from "express";
import { prisma } from "../repositories/db";

export const login = async (req: Request, res: Response): Promise<any> => {
  const { userType, username, password, email } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";

  if (!userType || (!username && !email) || !password) {
    console.warn(`[SECURITY AUDIT] Login Attempt Blocked (Validation) - IP: ${clientIp}`);
    return res.status(400).json({
      success: false,
      error: "Invalid request payload. Credentials required.",
      code: "AUTH_VALIDATION_FAILED"
    });
  }

  let authenticated = false;
  let userName = "";
  let userEmail = email || username || "";
  let role = "CADET";

  if (userType === "admin") {
    if ((username === "admin" || email === "admin@sbu.ac.in" || username === "ano.sbu") && (password === "admin123" || password === "ncc19jhr")) {
      authenticated = true;
      userName = "Associate NCC Officer (ANO)";
      userEmail = "admin@sbu.ac.in";
      role = "ADMIN";
    }
  } else if (userType === "cadet") {
    if (password.length >= 4) {
      authenticated = true;
      userName = username || email || "SBU Cadet";
      role = "CADET";
    }
  }

  if (!authenticated) {
    console.warn(`[SECURITY AUDIT] Login Failure - Role: ${userType}, IP: ${clientIp}`);
    return res.status(401).json({
      success: false,
      error: "Invalid email, username, or password.",
      code: "INVALID_CREDENTIALS"
    });
  }

  try {
    // Upsert mock user to satisfy foreign key constraint for sessions
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: {
        email: userEmail,
        passwordHash: "MOCKED_HASH",
        role: role as any
      }
    });

    const token = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`;
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    console.log(`[SECURITY AUDIT] Login Success - User: ${userName} (${userType}), ID: ${user.id}, IP: ${clientIp}`);

    return res.json({
      success: true,
      message: "Authentication successful.",
      data: {
        token,
        userType,
        user: {
          id: user.id,
          name: userName,
          email: user.email,
          role: userType
        },
        expiresAt: expiresAt.toISOString()
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Database error during login" });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const tokenFromReq = req.body?.token || tokenFromHeader;

  const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";

  if (tokenFromReq) {
    try {
      await prisma.session.delete({ where: { token: tokenFromReq } });
      console.log(`[SECURITY AUDIT] Logout Success - Token Purged, IP: ${clientIp}`);
    } catch (e) {
      console.log(`[SECURITY AUDIT] Logout Request Processed (Token not found) - IP: ${clientIp}`);
    }
  }

  return res.json({
    success: true,
    message: "Session terminated successfully."
  });
};

export const getMe = async (req: Request, res: Response): Promise<any> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized.",
      code: "UNAUTHORIZED"
    });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        error: "Session not found.",
        code: "UNAUTHORIZED"
      });
    }

    if (Date.now() > session.expiresAt.getTime()) {
      await prisma.session.delete({ where: { id: session.id } });
      return res.status(401).json({
        success: false,
        error: "Session expired.",
        code: "SESSION_EXPIRED"
      });
    }

    return res.json({
      success: true,
      data: {
        userType: session.user.role === "ADMIN" ? "admin" : "cadet",
        user: {
          id: session.user.id,
          name: session.user.email,
          email: session.user.email,
          role: session.user.role === "ADMIN" ? "admin" : "cadet"
        },
        expiresAt: session.expiresAt.toISOString()
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Database error" });
  }
};
