"""Auth package: user model, JWT, register/login."""

from auth.routes import router as auth_router

__all__ = ["auth_router"]
