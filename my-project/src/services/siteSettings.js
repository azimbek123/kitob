// Site settings management service
export const DEFAULT_SITE_SETTINGS = {
  phone1: '+998 71 200 00 00',
  phone2: '+998 90 123 45 67',
  email: 'info@kitobhon.uz',
  telegramUsername: '@kitobhon_admin',
  telegramChannel: 'https://t.me/kitobhon_uz',
  address: "Toshkent sh., Yunusobod tumani, Amir Temur shoh ko'chasi, 107-B",
  addressLandmark: 'Mo\'ljal: Metro "Bodomzor"',
  workingHours: '09:00 — 22:00 (Har kuni dam olishsiz)',
  onlineHours: 'Onlayn buyurtmalar 24/7 qabul qilinadi',
}

export const getSiteSettings = () => {
  try {
    const stored = localStorage.getItem('kitobhon_site_settings')
    if (stored) {
      return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Error reading site settings:', e)
  }
  return DEFAULT_SITE_SETTINGS
}

export const saveSiteSettings = (settings) => {
  try {
    localStorage.setItem('kitobhon_site_settings', JSON.stringify(settings))
    window.dispatchEvent(new CustomEvent('site-settings-changed', { detail: settings }))
    return true
  } catch (e) {
    console.error('Error saving site settings:', e)
    return false
  }
}

// Inquiries / Contact form messages stored locally
export const getStoredInquiries = () => {
  try {
    const stored = localStorage.getItem('kitobhon_inquiries')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const saveInquiry = (inquiry) => {
  try {
    const list = getStoredInquiries()
    const updated = [inquiry, ...list]
    localStorage.setItem('kitobhon_inquiries', JSON.stringify(updated))
    window.dispatchEvent(new Event('inquiries-changed'))
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const deleteInquiry = (id) => {
  try {
    const list = getStoredInquiries().filter((item) => item.id !== id)
    localStorage.setItem('kitobhon_inquiries', JSON.stringify(list))
    window.dispatchEvent(new Event('inquiries-changed'))
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const toggleInquiryStatus = (id) => {
  try {
    const list = getStoredInquiries().map((item) =>
      item.id === id
        ? { ...item, status: item.status === 'contacted' ? 'new' : 'contacted' }
        : item
    )
    localStorage.setItem('kitobhon_inquiries', JSON.stringify(list))
    window.dispatchEvent(new Event('inquiries-changed'))
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
