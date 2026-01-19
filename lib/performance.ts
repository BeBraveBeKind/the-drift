// Performance optimization utilities

// Debounce function to limit function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

// Throttle function to limit function calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// Lazy load images intersection observer
export function setupLazyLoading() {
  if (typeof window === 'undefined') return
  
  const images = document.querySelectorAll('img[loading="lazy"]')
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
          }
          imageObserver.unobserve(img)
        }
      })
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    })
    
    images.forEach((img) => imageObserver.observe(img))
  }
}

// Prefetch links on hover
export function setupLinkPrefetch() {
  if (typeof window === 'undefined') return
  
  const links = document.querySelectorAll('a[href^="/"]')
  
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const href = link.getAttribute('href')
      if (href) {
        const linkEl = document.createElement('link')
        linkEl.rel = 'prefetch'
        linkEl.href = href
        document.head.appendChild(linkEl)
      }
    }, { once: true })
  })
}