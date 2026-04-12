import os
from supabase import create_client, Client
from dotenv import load_dotenv

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
