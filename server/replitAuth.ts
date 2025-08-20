import { type RequestHandler } from "express";

export function getSession() {
  return (req, res, next) => next();
}

export async function setupAuth(app) {
  console.log("Authentication is disabled.");
  return;
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  return next();
};