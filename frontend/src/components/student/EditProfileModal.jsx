import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PiX, PiUser, PiCamera, PiLockKey, PiCheckCircle, PiWarningCircle } from 'react-icons/pi';
import { updateUserProfile, uploadProfilePhoto, getProfilePhotoUrl } from '../../services/api';

export default function EditProfileModal({ isOpen, onClose, user, onProfileUpdated }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imgError, setImgError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setPhotoPreview(user.profile_photo || null);
      setImgError(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setSuccessMsg('');
      setSelectedFile(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please select a valid image file (JPG, JPEG, PNG, WEBP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB.');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
    setImgError(false);

    // Instant live preview using Object URL
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    // Validate phone number if provided
    if (phone.trim()) {
      let cleanPhone = phone.trim();
      if (cleanPhone.startsWith('+91')) cleanPhone = cleanPhone.slice(3).trim();
      else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) cleanPhone = cleanPhone.slice(2).trim();

      if (!/^\d{10}$/.test(cleanPhone)) {
        setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
        return;
      }
    }

    // Validate password fields if any are filled
    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        setErrorMsg('Please enter your current password to change password.');
        return;
      }
      if (!newPassword) {
        setErrorMsg('Please enter your new password.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation password do not match.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
    }

    try {
      setLoading(true);
      let updatedUser = user;

      // 1. If photo file selected, upload photo first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('email', user.email);
        formData.append('student_id', user.student_id || user.usn || '');

        const photoRes = await uploadProfilePhoto(formData);
        if (photoRes && photoRes.success && photoRes.user) {
          updatedUser = photoRes.user;
        }
      }

      // 2. Update text fields & password
      const payload = {
        email: user.email,
        student_id: user.student_id || user.usn,
        full_name: fullName.trim(),
        phone: phone.trim(),
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
        confirm_password: confirmPassword || undefined,
        profile_photo: photoPreview && photoPreview.startsWith('data:image') ? photoPreview : undefined
      };

      const res = await updateUserProfile(payload);
      if (res && res.success && res.user) {
        updatedUser = res.user;
        localStorage.setItem('prmes_user', JSON.stringify(updatedUser));
        setSuccessMsg('Profile updated successfully!');
        if (onProfileUpdated) onProfileUpdated(updatedUser);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(res?.message || 'Failed to update profile details.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile with server.');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarLetter = () => {
    return fullName ? fullName.charAt(0).toUpperCase() : (user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U');
  };

  return (
    <div className="sd-modal-backdrop" onClick={onClose}>
      <motion.div
        className="sd-modal"
        style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sd-modal__close" onClick={onClose}>
          <PiX />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-cyan-soft)', color: 'var(--accent-cyan)', display: 'grid', placeItems: 'center', fontSize: '22px' }}>
            <PiUser />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
              Edit Profile
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              Update your account details and password for PRMES
            </p>
          </div>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PiWarningCircle style={{ fontSize: '16px', flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PiCheckCircle style={{ fontSize: '16px', flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 1. Profile Photo Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-hairline-strong)' }}>
            <div style={{ position: 'relative', width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: 'var(--accent-cyan-soft)', display: 'grid', placeItems: 'center', border: '2px solid var(--accent-cyan)', flexShrink: 0 }}>
              {photoPreview && !imgError ? (
                <img
                  src={getProfilePhotoUrl(photoPreview)}
                  alt="Profile Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {getAvatarLetter()}
                </span>
              )}
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                Profile Photo
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Supports JPG, JPEG, PNG, or WEBP (Max 5MB)
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoSelect}
              />
              <button
                type="button"
                className="sd-btn sd-btn-outline"
                style={{ padding: '5px 12px', fontSize: '12px', gap: '6px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <PiCamera /> Change Photo
              </button>
            </div>
          </div>

          {/* 2. Personal & Account Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Full Name *
              </label>
              <input
                type="text"
                className="register-input"
                style={{ width: '100%', padding: '9px 12px' }}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Mobile Number
              </label>
              <input
                type="text"
                className="register-input"
                style={{ width: '100%', padding: '9px 12px' }}
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Email Address (View-Only)
              </label>
              <input
                type="email"
                className="register-input"
                style={{ width: '100%', padding: '9px 12px', opacity: 0.6, background: 'var(--bg-canvas)' }}
                value={user.email || ''}
                disabled
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                USN / Student ID (View-Only)
              </label>
              <input
                type="text"
                className="register-input"
                style={{ width: '100%', padding: '9px 12px', opacity: 0.6, background: 'var(--bg-canvas)' }}
                value={user.student_id || user.usn || ''}
                disabled
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Department (View-Only)
              </label>
              <input
                type="text"
                className="register-input"
                style={{ width: '100%', padding: '9px 12px', opacity: 0.6, background: 'var(--bg-canvas)' }}
                value={user.department || 'Computer Science & Engineering'}
                disabled
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Semester (View-Only)
              </label>
              <input
                type="text"
                className="register-input"
                style={{ width: '100%', padding: '9px 12px', opacity: 0.6, background: 'var(--bg-canvas)' }}
                value={user.semester ? `${user.semester} (${user.section || 'A'})` : '7th Semester'}
                disabled
              />
            </div>
          </div>

          {/* 3. Change Password Section */}
          <div style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '12px' }}>
              <PiLockKey /> Change Password (Optional)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  className="register-input"
                  style={{ width: '100%', padding: '9px 12px' }}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    className="register-input"
                    style={{ width: '100%', padding: '9px 12px' }}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="register-input"
                    style={{ width: '100%', padding: '9px 12px' }}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="sd-btn sd-btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sd-btn sd-btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
