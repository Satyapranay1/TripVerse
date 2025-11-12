import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavbar from "@/components/TopNavbar";
import BottomNavBar from "@/components/BottomNavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, Globe2, LogOut, History, Lock, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const backend = "https://travel-app1-p0m8.onrender.com";

const currencyList = [
  { code: "USD", name: "United States" },
  { code: "INR", name: "India" },
  { code: "EUR", name: "Europe" },
  { code: "GBP", name: "United Kingdom" },
  { code: "JPY", name: "Japan" }
];

const conversionRates: Record<string, number> = {
  USD: 1,
  INR: 83.2,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 148.5
};

export default function Profile({ theme, toggleTheme }: any) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatarUrl: ""
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  // show/hide password toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/");

    fetch(`${backend}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setFormData({
          name: data.name,
          email: data.email,
          avatarUrl: data.avatarUrl || ""
        });
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.email)
      return toast.error("Name and Email are required!");

    const res = await fetch(`${backend}/api/auth/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: formData.name, email: formData.email })
    });

    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Update failed");

    toast.success("Profile updated!");
  };

  const handleChangePassword = async () => {
    const { oldPassword, newPassword, confirmNewPassword } = passwords;

    if (newPassword !== confirmNewPassword)
      return toast.error("New passwords do not match!");

    const res = await fetch(`${backend}/api/auth/update-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    const data = await res.json();
    if (!res.ok) return toast.error(data.message || "Password change failed");

    toast.success("Password changed successfully!");
    setPasswords({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
  };

  const handleAvatarUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;

      const res = await fetch(`${backend}/api/auth/upload-avatar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ avatarBase64: base64 })
      });

      if (!res.ok) return toast.error("Failed to update avatar");

      setFormData((prev) => ({ ...prev, avatarUrl: base64 as string }));
      toast.success("Profile picture updated!");
    };
    reader.readAsDataURL(file);
  };

  const convertCurrency = () => {
    if (!amount) return;
    setResult(
      (parseFloat(amount) * (conversionRates[toCurrency] / conversionRates[fromCurrency])).toFixed(2)
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 flex flex-col">
      <TopNavbar theme={theme} toggleTheme={toggleTheme} />

      <div className="container py-10 flex flex-col md:flex-row gap-10">

        {/* LEFT SECTION */}
        <div className="md:w-1/3 flex flex-col items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => document.getElementById("upload")?.click()}>
            <input type="file" accept="image/*" className="hidden" id="upload"
              onChange={(e) => e.target.files && handleAvatarUpload(e.target.files[0])} />

            <Avatar className="w-28 h-28 ring-4 ring-primary/20">
              {formData.avatarUrl
                ? <AvatarImage src={formData.avatarUrl} />
                : <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>}
            </Avatar>

            <div className="absolute inset-0 bg-black/40 rounded-full flex justify-center items-center opacity-0 group-hover:opacity-100 transition">
              <Camera className="text-white w-6 h-6" />
            </div>
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/profile/recent-trips")}>
            <History className="w-5 h-5" /> Recent Trips
          </Button>

          <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
            <LogOut className="w-5 h-5" /> Logout
          </Button>
        </div>

        {/* RIGHT SECTION */}
        <div className="md:w-2/3 space-y-8">

          {/* Personal Info */}
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle><CardDescription>Update your account details</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

              <Label>Email</Label>
              <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

              <Button className="w-full" onClick={handleSaveProfile}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">

              {/* Old Password */}
              <div className="relative">
                <Input type={showOld ? "text" : "password"} placeholder="Old Password"
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                  className="pr-10"
                />
                <button type="button" className="absolute right-3 top-2.5" onClick={() => setShowOld(!showOld)}>
                  {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <Input type={showNew ? "text" : "password"} placeholder="New Password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="pr-10"
                />
                <button type="button" className="absolute right-3 top-2.5" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm New Password */}
              <div className="relative">
                <Input type={showConfirm ? "text" : "password"} placeholder="Confirm New Password"
                  value={passwords.confirmNewPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
                  className="pr-10"
                />
                <button type="button" className="absolute right-3 top-2.5" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button className="w-full" onClick={handleChangePassword}><Lock className="mr-2 h-4 w-4" /> Change Password</Button>
            </CardContent>
          </Card>

          {/* Currency Converter */}
          <Card>
            <CardHeader><CardTitle className="flex gap-2"><Globe2 /> Currency Converter</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger><SelectValue placeholder="From" /></SelectTrigger>
                  <SelectContent>{currencyList.map(c => <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>)}</SelectContent>
                </Select>

                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger><SelectValue placeholder="To" /></SelectTrigger>
                  <SelectContent>{currencyList.map(c => <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>)}</SelectContent>
                </Select>

                <Input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>

              <Button className="w-full" onClick={convertCurrency}>Convert</Button>

              {result && <p className="text-center text-lg font-semibold">{amount} {fromCurrency} = {result} {toCurrency}</p>}
            </CardContent>
          </Card>

        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
