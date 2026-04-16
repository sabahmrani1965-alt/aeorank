'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '/services', label: 'Services' },
    { href: '/case-studies', label: 'Case Studies' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      padding: '0 48px', height: '68px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(6,17,42,0.97)' : 'rgba(6,17,42,0.88)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      transition: 'background 0.3s',
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <Image src="/logo.svg" alt="AEOrank" width={180} height={40} priority />
      </Link>

      {/* Desktop links */}
      <ul style={{ display: 'flex', alignItems: 'center', gap: '32px', listStyle: 'none' }}
          className="desktop-nav">
        {links.map(l => (
          <li key={l.href}>
            <Link href={l.href} style={{
              color: pathname === l.href ? '#fff' : '#8A96B0',
              textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
              transition: 'color 0.2s',
              borderBottom: pathname === l.href ? '1px solid #F2A83B' : 'none',
              paddingBottom: '2px',
            }}>{l.label}</Link>
          </li>
        ))}
        <li>
          <Link href="/contact" style={{
            background: 'linear-gradient(135deg, #F2A83B, #FBBF24)',
            color: '#06112A', padding: '9px 22px', borderRadius: '6px',
            fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
            transition: 'opacity 0.2s',
            whiteSpace: 'nowrap',
          }}>Book a Free AEO Audit</Link>
        </li>
      </ul>

      {/* Mobile burger */}
      <button onClick={() => setMenuOpen(!menuOpen)}
        className="mobile-burger"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#fff', fontSize: '1.5rem', display: 'none',
        }}>☰</button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '68px', left: 0, right: 0,
          background: '#06112A', borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
          zIndex: 199,
        }}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{ color: '#E8E4DC', textDecoration: 'none', fontSize: '1rem', fontWeight: 500 }}>
              {l.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="btn-gold"
            style={{ textAlign: 'center', justifyContent: 'center' }}>
            Book a Free AEO Audit
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-burger { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
