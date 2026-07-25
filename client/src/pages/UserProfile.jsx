import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Star,
  Clock,
  Edit2,
  Check,
  Truck,
  RefreshCw,
  Lock,
  LayoutGrid,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TODO: API INTEGRATION
// Replace every DUMMY_* block below with real hooks, matching
// this exact shape so nothing else in the JSX needs to change.
//
//   const { data: profile }       = useGetProfile();
//   const { data: ordersData }    = useMyOrders();
//   const { data: wishlistData }  = useWishlist();          // or Zustand store
//   const { data: addressesData } = useMyAddresses();
//   const updateProfileMutation   = useUpdateProfile();
//   const changePasswordMutation  = useChangePassword();
// ─────────────────────────────────────────────────────────────

// TODO: replace with `profile` from useGetProfile()
const DUMMY_PROFILE = {
  firstName: "Mehadi",
  lastName: "Hasan",
  email: "mehadi@example.com",
  phone: "+880 171 234 5678",
  address: "Bogura, Bangladesh",
  memberSince: "Jan 2024",
  isVerified: true,
  lastLoginAt: "2h ago",
  stats: {
    orders: 12,
    totalSpent: 8240,
    wishlist: 5,
    reviews: 3,
  },
};

// TODO: replace with `orders` from useMyOrders()
const DUMMY_ORDERS = [
  {
    id: "ORD-0041",
    name: "Wireless Headphones Pro",
    date: "Jun 20, 2026",
    price: 2499,
    status: "Delivered",
  },
  {
    id: "ORD-0040",
    name: "Mechanical Keyboard TKL",
    date: "Jun 15, 2026",
    price: 3799,
    status: "Processing",
  },
  {
    id: "ORD-0039",
    name: "USB-C Hub 7-in-1",
    date: "Jun 1, 2026",
    price: 1250,
    status: "Delivered",
  },
  {
    id: "ORD-0038",
    name: "RGB Mouse Pad XL",
    date: "May 22, 2026",
    price: 690,
    status: "Cancelled",
  },
];

// TODO: replace with wishlist items from useWishlist() / Zustand store
const DUMMY_WISHLIST = [
  { id: "w1", name: "Laptop Stand Pro", price: 1200 },
  { id: "w2", name: "TWS Earbuds", price: 899 },
  { id: "w3", name: "Webcam HD 1080p", price: 2100 },
  { id: "w4", name: "Phone Mount Desk", price: 450 },
  { id: "w5", name: "20000mAh Power Bank", price: 1650 },
];

// TODO: replace with `addresses` from useMyAddresses()
const DUMMY_ADDRESSES = [
  {
    id: "a1",
    label: "Home",
    default: true,
    lines: [
      "House 12, Road 4, Bogura Sadar",
      "Bogura, Rajshahi 5800",
      "Bangladesh",
    ],
  },
  {
    id: "a2",
    label: "Office",
    default: false,
    lines: ["Level 3, Tech Tower, Uttara", "Dhaka 1230", "Bangladesh"],
  },
];

const statusStyle = {
  Delivered: "bg-green-50 text-green-700",
  Processing: "bg-yellow-50 text-yellow-700",
  Cancelled: "bg-red-50 text-red-600",
};

const NAV_ITEMS = [
  { icon: LayoutGrid, label: "Overview", tab: "Overview" },
  { icon: Package, label: "My orders", tab: "Orders" },
  { icon: Heart, label: "Wishlist", tab: "Wishlist" },
  { icon: MapPin, label: "Addresses", tab: "Addresses" },
  { icon: Settings, label: "Settings", tab: "Settings" },
];

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [saved, setSaved] = useState(false);

  // TODO: swap these for real data once hooks are wired
  const profile = DUMMY_PROFILE;
  const orders = DUMMY_ORDERS;
  const wishlist = DUMMY_WISHLIST;
  const addresses = DUMMY_ADDRESSES;

  const initials =
    `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();

  const handleSave = () => {
    // TODO: call updateProfileMutation.mutate(formValues) here instead
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* No top navbar/tabs bar — sidebar is the only navigation on this page */}
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* ── Sidebar ── */}
          <aside className="flex flex-col gap-4">
            {/* Profile card — avatar/name moved here since the top header band was removed */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white text-base font-semibold shrink-0">
                  {initials || "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profile.firstName} {profile.lastName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    Since {profile.memberSince}
                  </p>
                </div>
              </div>
              {/* TODO: implement later — edit profile flow not built yet */}
              <Button
                variant="outline"
                disabled
                className="mt-3 w-full flex items-center justify-center gap-1.5 border-gray-300 text-gray-400 h-8 text-xs cursor-not-allowed"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit profile
              </Button>
            </div>

            {/* Contact card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                Contact
              </p>
              <div className="flex flex-col gap-2.5 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{profile.address}</span>
                </div>
              </div>
              <Separator className="my-3" />
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                Account
              </p>
              <div className="flex flex-col gap-2.5 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    {profile.isVerified
                      ? "Verified account"
                      : "Unverified account"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Last login {profile.lastLoginAt}</span>
                </div>
              </div>
            </div>

            {/* Quick nav — the ONLY navigation now (Overview added, was previously only in the removed top tabs) */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {NAV_ITEMS.map(({ icon: Icon, label, tab }, i, arr) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors hover:bg-gray-50 ${
                    i < arr.length - 1 ? "border-b border-gray-100" : ""
                  } ${activeTab === tab ? "text-gray-900 font-medium bg-gray-50" : "text-gray-500"}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
                </button>
              ))}
              <Separator />
              {/* TODO: wire to real logout API call (already exists per auth system) */}
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
                    { label: "Orders", value: profile.stats.orders },
                    {
                      label: "Total spent",
                      value: `৳${profile.stats.totalSpent.toLocaleString()}`,
                    },
                    { label: "Wishlist", value: profile.stats.wishlist },
                    { label: "Reviews", value: profile.stats.reviews },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="bg-white border border-gray-200 rounded-xl p-4"
                    >
                      <p className="text-2xl font-semibold text-gray-900">
                        {value}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent orders */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                      Recent orders
                    </p>
                    <button
                      onClick={() => setActiveTab("Orders")}
                      className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {orders.length === 0 ? (
                      <EmptyState icon={Package} text="No orders yet." />
                    ) : (
                      orders
                        .slice(0, 3)
                        .map((o) => <OrderRow key={o.id} order={o} />)
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ORDERS */}
            {activeTab === "Orders" && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                  All orders
                </p>
                <div className="flex flex-col gap-2">
                  {orders.length === 0 ? (
                    <EmptyState icon={Package} text="No orders yet." />
                  ) : (
                    orders.map((o) => <OrderRow key={o.id} order={o} />)
                  )}
                </div>
              </div>
            )}

            {/* WISHLIST */}
            {activeTab === "Wishlist" && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                  Saved items
                </p>
                <div className="flex flex-col gap-2">
                  {wishlist.length === 0 ? (
                    <EmptyState icon={Heart} text="Your wishlist is empty." />
                  ) : (
                    wishlist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 border border-gray-100 rounded-lg px-3 py-2.5"
                      >
                        <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                          <Heart className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-800 flex-1 truncate">
                          {item.name}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          ৳{item.price.toLocaleString()}
                        </span>
                        {/* TODO: wire to real add-to-cart action */}
                        <Button
                          size="sm"
                          className="bg-gray-900 hover:bg-gray-700 text-white h-7 text-xs px-3"
                        >
                          Add to cart
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ADDRESSES */}
            {activeTab === "Addresses" && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    Saved addresses
                  </p>
                  {/* TODO: wire to real "add address" flow */}
                  <Button
                    variant="outline"
                    className="h-8 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    + Add new
                  </Button>
                </div>
                {addresses.length === 0 ? (
                  <EmptyState icon={MapPin} text="No saved addresses yet." />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border border-gray-200 rounded-lg p-3.5 text-sm text-gray-500 relative"
                      >
                        {addr.default && (
                          <Badge className="absolute top-3 right-3 bg-gray-100 text-gray-600 border-0 text-xs font-normal">
                            Default
                          </Badge>
                        )}
                        <p className="font-medium text-gray-800 mb-1">
                          {addr.label}
                        </p>
                        {addr.lines.map((l) => (
                          <p key={l}>{l}</p>
                        ))}
                        {/* TODO: wire to real "edit address" flow */}
                        <button className="text-xs text-gray-400 hover:text-gray-700 mt-2 transition-colors">
                          Edit address
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === "Settings" && (
              <>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
                    Personal info
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <SettingsField
                      label="First name"
                      defaultValue={profile.firstName}
                    />
                    <SettingsField
                      label="Last name"
                      defaultValue={profile.lastName}
                    />
                  </div>
                  <SettingsField
                    label="Email"
                    defaultValue={profile.email}
                    type="email"
                  />
                  <div className="mt-3">
                    <SettingsField
                      label="Phone"
                      defaultValue={profile.phone}
                      type="tel"
                    />
                  </div>
                  {/* TODO: replace handleSave with updateProfileMutation.mutate(formValues) */}
                  <Button
                    onClick={handleSave}
                    className="mt-4 bg-gray-900 hover:bg-gray-700 text-white h-10 w-full sm:w-auto px-6"
                  >
                    {saved ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5" /> Saved
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                      Change password
                    </p>
                  </div>
                  <SettingsField
                    label="Current password"
                    type="password"
                    placeholder="••••••••"
                  />
                  <div className="mt-3">
                    <SettingsField
                      label="New password"
                      type="password"
                      placeholder="Min 8 characters"
                    />
                  </div>
                  <div className="mt-3">
                    <SettingsField
                      label="Confirm new password"
                      type="password"
                      placeholder="Repeat new password"
                    />
                  </div>
                  {/* TODO: wire to changePasswordMutation.mutate(formValues) */}
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
        <p className="text-sm font-medium text-gray-800 truncate">
          {order.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {order.date} · {order.id}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-gray-900">
          ৳{order.price.toLocaleString()}
        </p>
        <Badge
          className={`text-xs border-0 font-normal mt-0.5 ${statusStyle[order.status]}`}
        >
          {order.status}
        </Badge>
      </div>
    </div>
  );
}

function SettingsField({
  label,
  defaultValue = "",
  type = "text",
  placeholder,
}) {
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

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Icon className="w-8 h-8 text-gray-300" />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
