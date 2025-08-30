"use client";
import React, { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

function ProfilePage() {
  const { data: session } = useSession();
  const [editMode, setEditMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      // console.log("selected file", selectedFile);
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleImgUpdate = async () => {
    setIsUpdating(true);

    if (!file) {
      toast.error("Please select an image to upload.", {
        duration: 2000,
        position: "top-center",
      });
      setIsUpdating(false);
      return;
    }

    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      toast.error("Please upload a valid image file (<= 10MB).", {
        duration: 2000,
        position: "top-center",
      });
      setIsUpdating(false);
      return;
    }

    try {
      // Upload to Cloudinary (unsigned preset)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "GitBooster_Profile");

      const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloud_name) throw new Error("Cloudinary cloud name is not set");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Image upload failed: ${text}`);
      }

      const imgData = await response.json();
      // console.log("Cloudinary response:", imgData);
      const imgUrl = imgData.secure_url;
      if (!imgUrl) throw new Error("Image URL not found after upload");

      const data = await fetch("/api/user/change-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imgUrl }),
      });

      if (!data.ok) {
        const text = await data.text();
        throw new Error(`Failed to update image: ${text}`);
      }

      router.refresh(); 
      toast.success("Profile image updated successfully!", {
        duration: 2000,
        position: "top-center",
      });
      
    } 
    catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to update image. Please try again.", {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsUpdating(false);
      setEditMode(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!session) {
    return (
      <div className="mx-auto mt-10 max-w-sm rounded border p-4 text-center shadow">
        <p className="text-lg font-semibold">No user found.</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <Card className="mx-auto mt-10 max-w-md p-6 shadow-lg w-full text-white bg-slate-800/30 backdrop-blur-sm border-r bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-semibold">
          My Profile
        </CardTitle>
      </CardHeader>

      <img
        src={session.user?.image ?? "https://ui-avatars.com/api/?name=User"}
        className="mx-auto mb-4 h-24 w-24 rounded-full object-cover shadow-md border-amber-400 border-2"
        alt={`${session.user?.name ?? "User"}'s profile`}
      />

      {editMode ? (
        <form className="mb-4 space-y-2" onSubmit={(e) => e.preventDefault()}>
          <label className="block text-sm font-medium">
            Upload new profile image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleImgChange}
            accept="image/*"
            className="w-full rounded border px-3 py-2 bg-white/5"
            aria-label="Choose profile image"
          />

          <div className="flex justify-center gap-2">
            <Button
              variant="default"
              type="button"
              onClick={handleImgUpdate}
              disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setEditMode(false);
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={isUpdating}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => setEditMode(true)}>
          Edit Profile Image
        </Button>
      )}

      <p className="text-lg text-center font-semibold">
        Username: {session.user?.name}
      </p>
      <p className="text-lg text-center font-semibold">
        Email: {session.user?.email}
      </p>

      <Button
        variant="outline"
        onClick={() => router.push("/")}
        className="bg-sky-400 mt-4">
        Go Back
      </Button>
    </Card>
  );
}

export default ProfilePage;
