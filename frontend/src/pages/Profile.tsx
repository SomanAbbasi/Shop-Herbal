import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import type { Address, User } from '@/types';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Shield,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    businessName: '',
  });

  const [addressForm, setAddressForm] = useState({
    label: 'Office',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, addressesRes] = await Promise.all([
        userService.getProfile(),
        userService.getAddresses(),
      ]);
      if (profileRes.status) {
        setUser(profileRes.data);
        setProfileForm({
          name: profileRes.data.name,
          phone: profileRes.data.phone,
          businessName: profileRes.data.businessName,
        });
      }
      if (addressesRes.status) {
        setAddresses(addressesRes.data);
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await userService.updateProfile(profileForm);
      if (res.status) {
        setUser(res.data);
        refreshUser();
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await userService.addAddress(addressForm);
      if (res.status) {
        setAddresses(res.data);
        setShowAddressForm(false);
        resetAddressForm();
        toast.success('Address added');
      }
    } catch {
      toast.error('Failed to add address');
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;
    try {
      const res = await userService.updateAddress(editingAddress.id, addressForm);
      if (res.status) {
        setAddresses(res.data);
        setEditingAddress(null);
        resetAddressForm();
        toast.success('Address updated');
      }
    } catch {
      toast.error('Failed to update address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await userService.deleteAddress(id);
      if (res.status) {
        setAddresses(res.data);
        toast.success('Address deleted');
      }
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: 'Office',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false,
    });
  };

  const startEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setShowAddressForm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAF5] flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#3B8524]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAF5] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#111111] mb-8">My Profile</h1>

        {/* Profile Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#111111]">Personal Information</h2>
            <button
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setProfileForm({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    businessName: user?.businessName || '',
                  });
                } else {
                  setIsEditing(true);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#3B8524] bg-[#E6F6CA] rounded-lg hover:bg-[#d4e9b3] transition-colors"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    minLength={7}
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={profileForm.businessName}
                    onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-[#3B8524] text-white rounded-xl font-medium hover:bg-[#2d6b1b] transition-colors"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#E6F6CA] rounded-xl flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-[#3B8524]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#E6F6CA] rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#3B8524]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#E6F6CA] rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#3B8524]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user?.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#E6F6CA] rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#3B8524]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="font-medium">{user?.businessName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#E6F6CA] rounded-xl flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-[#3B8524]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : user?.status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <Star className="w-3 h-3" />
                    {user?.status?.charAt(0).toUpperCase()}{user?.status?.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#111111]">Shipping Addresses</h2>
            <button
              onClick={() => {
                setEditingAddress(null);
                resetAddressForm();
                setShowAddressForm(!showAddressForm);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#3B8524] bg-[#E6F6CA] rounded-lg hover:bg-[#d4e9b3] transition-colors"
            >
              {showAddressForm ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Address
                </>
              )}
            </button>
          </div>

          {showAddressForm && (
            <form
              onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
              className="bg-[#F9FAF5] rounded-xl p-5 mb-6 space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input
                    type="text"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    placeholder="Office, Warehouse, etc."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="123 Main St"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="New York"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="NY"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    placeholder="10001"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    placeholder="USA"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 bg-white"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#3B8524] focus:ring-[#3B8524]"
                />
                <span className="text-sm text-gray-600">Set as default address</span>
              </label>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-[#3B8524] text-white rounded-xl font-medium hover:bg-[#2d6b1b] transition-colors"
              >
                <Check className="w-4 h-4" />
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No addresses yet. Add your first shipping address.</p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`flex items-start justify-between p-4 rounded-xl border ${
                    addr.isDefault
                      ? 'border-[#3B8524] bg-[#E6F6CA]/20'
                      : 'border-gray-100 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#E6F6CA] rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#3B8524]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{addr.label}</p>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-[#3B8524] text-white text-[10px] font-medium rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{addr.street}</p>
                      <p className="text-sm text-gray-500">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-sm text-gray-500">{addr.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditAddress(addr)}
                      className="p-2 text-gray-400 hover:text-[#3B8524] hover:bg-[#E6F6CA] rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
