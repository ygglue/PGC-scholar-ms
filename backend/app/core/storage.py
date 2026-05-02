import os
from supabase import create_client, Client
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
else:
    supabase = None
    print("Warning: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")

def get_supabase() -> Client:
    return supabase

def upload_document(path: str, file_bytes: bytes, content_type: str):
    if not supabase:
        raise Exception("Supabase client not configured. Check your .env file.")
    return supabase.storage.from_("scholar-documents").upload(
        path=path,
        file=file_bytes,
        file_options={"content-type": content_type}
    )

def create_signed_url(path: str, expires_in: int = 120) -> str:
    if not supabase:
        raise Exception("Supabase client not configured. Check your .env file.")
    result = supabase.storage.from_("scholar-documents").create_signed_url(
        path=path,
        expires_in=expires_in
    )
    return result.get("signedURL")

def delete_document(path: str):
    if not supabase:
        raise Exception("Supabase client not configured. Check your .env file.")
    supabase.storage.from_("scholar-documents").remove([path])

def upload_avatar(scholar_id: str, file_bytes: bytes) -> str:
    if not supabase:
        raise Exception("Supabase client not configured. Check your .env file.")
    
    img = Image.open(io.BytesIO(file_bytes))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    img.thumbnail((400, 400))
    out_io = io.BytesIO()
    img.save(out_io, format="WEBP", quality=85)
    out_bytes = out_io.getvalue()
    
    path = f"{scholar_id}/avatar.webp"
    bucket = "scholar-avatars"
    
    try:
        supabase.storage.from_(bucket).upload(
            path=path,
            file=out_bytes,
            file_options={"content-type": "image/webp", "x-upsert": "true"}
        )
    except Exception:
        supabase.storage.from_(bucket).update(
            path=path,
            file=out_bytes,
            file_options={"content-type": "image/webp"}
        )
    
    return supabase.storage.from_(bucket).get_public_url(path)

def delete_avatar(scholar_id: str):
    if not supabase:
        raise Exception("Supabase client not configured.")
    path = f"{scholar_id}/avatar.webp"
    supabase.storage.from_("scholar-avatars").remove([path])
