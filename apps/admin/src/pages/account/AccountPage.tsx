import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { usersApi } from "../../lib/usersApi";
import { packagesApi } from "../../lib/packagesApi";
import { apiClient } from "../../lib/apiClient";
import { userMessage } from "../../lib/userMessage";
import type { UserRole, StaffAvailability } from "@flyora/types";
import {
  Camera,
  Trash2,
  Lock,
  Shield,
  Check,
  AlertCircle,
  Loader2,
  Mail,
  User,
  Phone,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react";

const ROLE_NAMES: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Administrator",
  OPERATIONS_MANAGER: "Operations Manager",
  SERVICE_COORDINATOR: "Service Coordinator (Staff)",
  ACCOUNTS: "Accounts Specialist",
  CONTENT_MANAGER: "Content Manager",
};

const AVAILABILITY_OPTIONS: {
  value: StaffAvailability;
  label: string;
  description: string;
  dotColor: string;
}[] = [
  {
    value: "AVAILABLE",
    label: "Available",
    description: "Active and receiving incoming lead assignments",
    dotColor: "bg-emerald-500",
  },
  {
    value: "BUSY",
    label: "Busy",
    description: "Working on ongoing quotations or bookings",
    dotColor: "bg-amber-500",
  },
  {
    value: "OFF_DUTY",
    label: "Off Duty",
    description: "Not taking leads or active requests currently",
    dotColor: "bg-zinc-400",
  },
];

const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Optimizes an uploaded image using browser canvas high-quality smoothing.
 * Crops to square centered on upper body / face (top 20% offset) and outputs
 * a sharp 512x512 high-DPI image for crystal clear display across all screens.
 */
async function createOptimizedAvatar(file: File): Promise<File> {
  return new Promise((resolve) => {
    // If not in a browser environment or not an image, pass original
    if (
      typeof window === "undefined" ||
      typeof document === "undefined" ||
      !file.type.startsWith("image/") ||
      typeof Image === "undefined" ||
      !URL.createObjectURL ||
      (typeof navigator !== "undefined" &&
        navigator.userAgent.includes("jsdom"))
    ) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    // Timeout fallback for environments where image load doesn't trigger
    const timer = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    }, 1500);

    img.onload = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
      try {
        const targetSize = 512;
        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const srcWidth = img.naturalWidth || img.width;
        const srcHeight = img.naturalHeight || img.height;

        let cropWidth = srcWidth;
        let cropHeight = srcHeight;
        let cropX = 0;
        let cropY = 0;

        if (srcWidth > srcHeight) {
          cropWidth = srcHeight;
          cropX = (srcWidth - srcHeight) / 2;
        } else if (srcHeight > srcWidth) {
          cropHeight = srcWidth;
          // Position crop box higher up to keep face, eyes, and hair centered
          const extraY = srcHeight - srcWidth;
          cropY = Math.min(extraY * 0.2, extraY);
        }

        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          targetSize,
          targetSize,
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const ext = file.name.split(".").pop() || "png";
              const cleanBase = file.name
                .replace(/\.[^/.]+$/, "")
                .substring(0, 30);
              const optimized = new File([blob], `${cleanBase}-hd.${ext}`, {
                type: blob.type || file.type,
              });
              resolve(optimized);
            } else {
              resolve(file);
            }
          },
          file.type === "image/png" ? "image/png" : "image/jpeg",
          0.95,
        );
      } catch {
        resolve(file);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export function AccountPage() {
  const { user, setUser, setAvailability } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phone state
  const [phone, setPhone] = useState(user?.phone || "");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync phone if user updates
  useEffect(() => {
    setPhone(user?.phone || "");
  }, [user?.phone]);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);

  // Availability state
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );

  const initialLetter = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : "U";

  // Handle avatar upload via Cloudflare R2
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset messages
    setAvatarError(null);
    setAvatarSuccess(null);

    // Validate type and size
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setAvatarError("Please select a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setAvatarError("Photo must be 5 MB or smaller.");
      return;
    }

    try {
      setUploadingAvatar(true);
      setUploadProgress(10);

      // 1. Optimize image to 512x512 high-DPI with face centering
      const fileToUpload = await createOptimizedAvatar(file);

      // 2. Get Presigned Upload URL from backend for 'avatars' folder
      const presigned = await packagesApi.getPresignedUploadUrl(
        fileToUpload.name,
        fileToUpload.type,
        "avatars",
      );

      setUploadProgress(40);

      // 3. Direct upload to Cloudflare R2
      await packagesApi.directUploadToR2(
        presigned.uploadUrl,
        fileToUpload,
        (percent) => {
          setUploadProgress(Math.max(40, percent));
        },
      );

      setUploadProgress(90);

      // 4. Update user profile in backend database
      const updatedUser = await usersApi.updateProfile({
        avatarUrl: presigned.publicUrl,
      });

      // 5. Update auth store
      setUser(updatedUser);
      setAvatarSuccess("Profile photo updated with HD clarity!");
    } catch (err) {
      setAvatarError(
        userMessage(err, "Failed to upload profile photo. Please try again."),
      );
    } finally {
      setUploadingAvatar(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle remove avatar
  const handleRemoveAvatar = async () => {
    if (!user?.avatarUrl || uploadingAvatar) return;
    setAvatarError(null);
    setAvatarSuccess(null);

    try {
      setUploadingAvatar(true);
      const updatedUser = await usersApi.updateProfile({
        avatarUrl: null,
      });
      setUser(updatedUser);
      setAvatarSuccess("Profile photo removed.");
    } catch (err) {
      setAvatarError(
        userMessage(err, "Failed to remove profile photo. Please try again."),
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle save phone
  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || savingPhone) return;

    setSavingPhone(true);
    setPhoneMessage(null);

    try {
      const updatedUser = await usersApi.updateProfile({
        phone: phone.trim() || null,
      });
      setUser(updatedUser);
      setPhoneMessage({
        type: "success",
        text: "Phone number updated successfully.",
      });
    } catch (err) {
      setPhoneMessage({
        type: "error",
        text: userMessage(
          err,
          "Failed to update phone number. Please try again.",
        ),
      });
    } finally {
      setSavingPhone(false);
    }
  };

  // Handle availability change
  const handleAvailabilityChange = async (newStatus: StaffAvailability) => {
    if (!user || user.availability === newStatus || updatingAvailability)
      return;

    setUpdatingAvailability(true);
    setAvailabilityError(null);

    try {
      await apiClient.patch(`/users/${user.id}/availability`, {
        availability: newStatus,
      });
      setAvailability(newStatus);
    } catch (err) {
      setAvailabilityError(
        userMessage(err, "Unable to change availability status."),
      );
    } finally {
      setUpdatingAvailability(false);
    }
  };

  return (
    <div className="account-page max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Title & Context */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Review your credentials, update your personal contact details, and
          configure your profile photo.
        </p>
      </div>

      {/* 1. Profile Photo & Quick Identity Card */}
      <section className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar preview */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-3xl overflow-hidden shadow-sm ring-4 ring-zinc-100">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || "User Avatar"}
                  className="w-full h-full object-cover object-[center_20%] [image-rendering:-webkit-optimize-contrast] [image-rendering:high-quality]"
                />
              ) : (
                <span className="select-none tracking-wide">
                  {initialLetter}
                </span>
              )}
            </div>

            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white text-xs gap-1">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>
                  {uploadProgress
                    ? `${uploadProgress}%`
                    : "Optimizing & uploading..."}
                </span>
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-xl font-bold text-zinc-900">
                  {user?.fullName || "Staff Member"}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                  <Shield className="w-3 h-3 text-zinc-500" />
                  {user?.role ? ROLE_NAMES[user.role] : "Staff"}
                </span>
              </div>
              <p className="text-sm text-zinc-500 mt-0.5">{user?.email}</p>
            </div>

            {/* Photo Actions */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploadingAvatar}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 rounded-lg transition-colors border border-zinc-200/60 disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-zinc-600" />
                {user?.avatarUrl ? "Change photo" : "Upload photo"}
              </button>

              {user?.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>

            <p className="text-xs text-zinc-400">
              JPG, PNG or WebP · High-DPI optimized · Stored directly on
              Cloudflare R2
            </p>

            {avatarError && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200/60 px-3 py-2 rounded-lg mt-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{avatarError}</span>
              </div>
            )}

            {avatarSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-2 rounded-lg mt-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{avatarSuccess}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Admin Configured Information (Read-Only) */}
      <section className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-zinc-100 bg-gradient-to-r from-zinc-50/50 to-white">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900">
                Credentials & System Settings
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                These settings were configured by your organization's
                administrator and cannot be changed here.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={user?.fullName || ""}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 cursor-not-allowed select-none focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1">
                <Shield className="w-3 h-3 text-zinc-400" />
                Managed by Administrator
              </p>
            </div>

            {/* Username / Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  readOnly
                  disabled
                  value={user?.email || ""}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 cursor-not-allowed select-none focus:outline-none font-mono text-xs sm:text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1">
                <Shield className="w-3 h-3 text-zinc-400" />
                Managed by Administrator
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  readOnly
                  disabled
                  value="••••••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 cursor-not-allowed select-none focus:outline-none tracking-widest"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1">
                <Shield className="w-3 h-3 text-zinc-400" />
                Managed by Administrator
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                Assigned Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={user?.role ? ROLE_NAMES[user.role] : "Staff"}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 cursor-not-allowed select-none focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1">
                <Shield className="w-3 h-3 text-zinc-400" />
                Access permissions set by Administrator
              </p>
            </div>
          </div>

          {/* Assigned Services */}
          <div className="pt-2 border-t border-zinc-100">
            <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              Assigned Services
            </label>
            {user?.services && user.services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.services.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {item.service?.name || item.serviceId}
                    {item.isPrimary && (
                      <span className="ml-1 text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic bg-zinc-50 border border-zinc-200/60 rounded-xl px-4 py-3">
                {user?.role === "SUPER_ADMIN" ||
                user?.role === "OPERATIONS_MANAGER"
                  ? "Full operational access to all travel services and packages across the platform."
                  : "No specific services currently assigned. Contact your administrator if needed."}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 3. Editable Personal Details Card */}
      <section className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-zinc-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900">
                Personal Contact Details
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                Update your contact number so coordinators and managers can
                reach you.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSavePhone} className="p-6 sm:p-8 space-y-6">
          <div>
            <label
              htmlFor="phone-input"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2"
            >
              Phone Number
            </label>
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199 or 9876543210"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
            <p className="text-xs text-zinc-400 mt-1.5">
              Direct phone or WhatsApp number for internal and customer
              communications.
            </p>
          </div>

          {phoneMessage && (
            <div
              className={`flex items-center gap-2 text-xs px-3.5 py-2.5 rounded-xl border max-w-md ${
                phoneMessage.type === "success"
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                  : "text-rose-700 bg-rose-50 border-rose-200/60"
              }`}
            >
              {phoneMessage.type === "success" ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{phoneMessage.text}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={savingPhone || phone === (user?.phone || "")}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {savingPhone && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </section>

      {/* 4. Staff Work Availability */}
      <section className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-zinc-100">
          <h3 className="text-base font-semibold text-zinc-900">
            Work Availability Status
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Set your current working status. When Available, you can
            automatically receive new enquiries.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-3">
          {availabilityError && (
            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200/60 px-3.5 py-2.5 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{availabilityError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {AVAILABILITY_OPTIONS.map((opt) => {
              const isSelected = user?.availability === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleAvailabilityChange(opt.value)}
                  disabled={updatingAvailability}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-zinc-900 bg-zinc-50/70 shadow-xs ring-1 ring-zinc-900"
                      : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${opt.dotColor}`}
                    />
                    <span className="font-semibold text-xs text-zinc-900">
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    {opt.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
