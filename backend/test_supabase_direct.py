import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.storage import supabase

def test_upload():
    if not supabase:
        print("Supabase client is None")
        return
        
    try:
        print("Attempting test upload...")
        res = supabase.storage.from_("scholar-documents").upload(
            path="test/dummy.txt",
            file=b"test data",
            file_options={"content-type": "text/plain"}
        )
        print("Upload successful:", res)
        # cleanup
        supabase.storage.from_("scholar-documents").remove(["test/dummy.txt"])
    except Exception as e:
        print("Failed with exception:", str(e))
        print("Type:", type(e))

if __name__ == "__main__":
    test_upload()
