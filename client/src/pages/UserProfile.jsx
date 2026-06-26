import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User, Mail, Phone, MapPin, Package,
  Heart, Settings, LogOut, ChevronRight,
  ShieldCheck, Star, Clock, Edit2, Check,
  Truck, RefreshCw, Lock,
} from "lucide-react";

const TABS = ["Overview", "Orders", "Wishlist", "Addresses", "Settings"];

const ORDERS = [
  { id: "ORD-0041", name: "Wireless Headphones Pro", date: "Jun 20, 2026", price: 2499, status: "Delivered" },
  { id: "ORD-0040", name: "Mechanical Keyboard TKL", date: "Jun 15, 2026", price: 3799, status: "Processing" },
  { id: "ORD-0039", name: "USB-C Hub 7-in-1",        date: "Jun 1, 2026",  price: 1250, status: "Delivered" },
  { id: "ORD-0038", name: "RGB Mouse Pad XL",         date: "May 22, 2026", price: 690,  status: "Cancelled" },
];

const WISHLIST = [
  { name: "Laptop Stand Pro", price: 1200 },
  { name: "TWS Earbuds",      price: 899  },
  { name: "Webcam HD 1080p",  price: 2100 },
  { name: "Phone Mount Desk", price: 450  },
  { name: "20000mAh Power Bank", price: 1650 },
];

const statusStyle = {
  Delivered:  "bg-green-50 text-green-700",
  Processing: "bg-yellow-50 text-yellow-700",
  Cancelled:  "bg-red-50 text-red-600",
};

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header band ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-semibold shrink-0">
              MH
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 truncate">Mehadi Hasan</h1>
              <p className="text-sm text-gray-500 mt-0.5">mehadi@example.com · Member since Jan 2024</p>
            </div>
            <Button variant="outline" className="hidden sm:flex items-center gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-50 h-9 text-sm">
              <Edit2 className="w-3.5 h-3.5" /> Edit profile
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-5 -mb-px overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "border-gray-900 text-gray-900 font-medium"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">

          {/* ── Sidebar ── */}
          <aside className="flex flex-col gap-4">
            {/* Contact card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Contact</p>
              <div className="flex flex-col gap-2.5 text-sm text-gray-500">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" /><span className="truncate">mehadi@example.com</span></div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /><span>+880 171 234 5678</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /><span>Bogura, Bangladesh</span></div>
              </div>
              <Separator className="my-3" />
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Account</p>
              <div className="flex flex-col gap-2.5 text-sm text-gray-500">
                <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 shrink-0" /><span>Verified account</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" /><span>Last login 2h ago</span></div>
              </div>
            </div>

            {/* Quick nav */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {[
                { icon: Package,  label: "My orders",   tab: "Orders"    },
                { icon: Heart,    label: "Wishlist",     tab: "Wishlist"  },
                { icon: MapPin,   label: "Addresses",    tab: "Addresses" },
                { icon: Settings, label: "Settings",     tab: "Settings"  },
              ].map(({ icon: Icon, label, tab }, i, arr) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors hover:bg-gray-50 ${
                    i < arr.length - 1 ? "border-b border-gray-100" : ""
                  } ${activeTab === tab ? "text-gray-900 font-medium" : "text-gray-500"}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
                </button>
              ))}
              <Separator />
              <button className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4 shrink-0" /> Sign out
              </button>
            </div>
          </aside>

          {/* ── Main panel ── */}
          <main className="flex flex-col gap-4">

            {/* OVERVIEW */}
            {activeTab === "Overview" && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Orders",       value: "12"     },
                    { label: "Total spent",  value: "৳8,240" },
                    { label: "Wishlist",     value: "5"      },
                    { label: "Reviews",      value: "3"      },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
                      <p className="text-2xl font-semibold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-400 mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent orders */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Recent orders</p>
                    <button onClick={() => setActiveTab("Orders")} className="text-xs text-gray-500 hover:text-gray-800 transition-colors">View all →</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {ORDERS.slice(0, 3).map((o) => (
                      <OrderRow key={o.id} order={o} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ORDERS */}
            {activeTab === "Orders" && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">All orders</p>
                <div className="flex flex-col gap-2">
                  {ORDERS.map((o) => (
                    <OrderRow key={o.id} order={o} />
                  ))}
                </div>
              </div>
            )}

            {/* WISHLIST */}
            {activeTab === "Wishlist" && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Saved items</p>
                <div className="flex flex-col gap-2">
                  {WISHLIST.map((item) => (
                    <div key={item.name} className="flex items-center gap-3 border border-gray-100 rounded-lg px-3 py-2.5">
                      <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-800 flex-1 truncate">{item.name}</span>
                      <span className="text-sm font-medium text-gray-900">৳{item.price.toLocaleString()}</span>
                      <Button size="sm" className="bg-gray-900 hover:bg-gray-700 text-white h-7 text-xs px-3">Add to cart</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADDRESSES */}
            {activeTab === "Addresses" && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Saved addresses</p>
                  <Button variant="outline" className="h-8 text-xs border-gray-300 text-gray-700 hover:bg-gray-50">+ Add new</Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: "Home", default: true,  lines: ["House 12, Road 4, Bogura Sadar", "Bogura, Rajshahi 5800", "Bangladesh"] },
                    { label: "Office", default: false, lines: ["Level 3, Tech Tower, Uttara", "Dhaka 1230", "Bangladesh"] },
                  ].map((addr) => (
                    <div key={addr.label} className="border border-gray-200 rounded-lg p-3.5 text-sm text-gray-500 relative">
                      {addr.default && (
                        <Badge className="absolute top-3 right-3 bg-gray-100 text-gray-600 border-0 text-xs font-normal">Default</Badge>
                      )}
                      <p className="font-medium text-gray-800 mb-1">{addr.label}</p>
                      {addr.lines.map((l) => <p key={l}>{l}</p>)}
                      <button className="text-xs text-gray-400 hover:text-gray-700 mt-2 transition-colors">Edit address</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === "Settings" && (
              <>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Personal info</p>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <SettingsField label="First name" defaultValue="Mehadi" />
                    <SettingsField label="Last name"  defaultValue="Hasan"  />
                  </div>
                  <SettingsField label="Email"  defaultValue="mehadi@example.com" type="email" />
                  <div className="mt-3">
                    <SettingsField label="Phone" defaultValue="+880 171 234 5678" type="tel" />
                  </div>
                  <Button
                    onClick={handleSave}
                    className="mt-4 bg-gray-900 hover:bg-gray-700 text-white h-10 w-full sm:w-auto px-6"
                  >
                    {saved ? <><Check className="w-4 h-4 mr-1.5" /> Saved</> : "Save changes"}
                  </Button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Change password</p>
                  </div>
                  <SettingsField label="Current password"     type="password" placeholder="••••••••"          />
                  <div className="mt-3">
                    <SettingsField label="New password"         type="password" placeholder="Min 8 characters"  />
                  </div>
                  <div className="mt-3">
                    <SettingsField label="Confirm new password" type="password" placeholder="Repeat new password"/>
                  </div>
                  <Button className="mt-4 bg-gray-900 hover:bg-gray-700 text-white h-10 w-full sm:w-auto px-6">
                    Update password
                  </Button>
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order }) {
  return (
    <div className="flex items-center gap-3 border border-gray-100 rounded-lg px-3 py-2.5">
      <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
        <Package className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{order.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{order.date} · {order.id}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-gray-900">৳{order.price.toLocaleString()}</p>
        <Badge className={`text-xs border-0 font-normal mt-0.5 ${statusStyle[order.status]}`}>
          {order.status}
        </Badge>
      </div>
    </div>
  );
}

function SettingsField({ label, defaultValue = "", type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg text-gray-800 bg-white placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
      />
    </div>
  );
}