import { notFoundResponse } from '@/middleware/error'

async function handleNotFound(request: Request) {
  return notFoundResponse(request)
}

export async function GET(request: Request) {
  return handleNotFound(request)
}

export async function POST(request: Request) {
  return handleNotFound(request)
}

export async function PUT(request: Request) {
  return handleNotFound(request)
}

export async function PATCH(request: Request) {
  return handleNotFound(request)
}

export async function DELETE(request: Request) {
  return handleNotFound(request)
}

export async function OPTIONS(request: Request) {
  return handleNotFound(request)
}