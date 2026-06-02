import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useModalAnimation } from '../hooks/useModalAnimation'
import { Masthead, SectionRule, Kicker, InitialsAvatar, PlusIcon, XIcon, posterColor } from '../components/RoomyUI'
import PillNav from '../components/PillNav'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300'
const TMDB_API_BASE = 'https://api.themoviedb.org/3'

// ─── OSM category mapping ─────────────────────────────────────────────────────

const OSM_CATEGORY_MAP = {
  restaurant: 'Restaurant', cafe: 'Café', bar: 'Bar', pub: 'Bar',
  fast_food: 'Fast food', food_court: 'Food court',
  supermarket: 'Supermarket', marketplace: 'Market',
  museum: 'Museum', gallery: 'Gallery', theatre: 'Theatre', cinema: 'Cinema',
  park: 'Park', garden: 'Garden', nature_reserve: 'Nature',
  hiking: 'Hiking', viewpoint: 'Viewpoint', beach: 'Beach',
  gym: 'Gym', sports_centre: 'Sports',
  hotel: 'Hotel', hostel: 'Hostel',
  pharmacy: 'Pharmacy', hospital: 'Hospital',
  library: 'Library', university: 'University',
  shop: 'Shop', mall: 'Mall',
  attraction: 'Attraction', tourism: 'Tourism',
  place_of_worship: 'Place of worship',
}

function getOsmCategory(result) {
  const type = result.type || ''
  const cls = result.class || ''
  const tag = type || cls
  return OSM_CATEGORY_MAP[tag] || OSM_CATEGORY_MAP[cls] || capitalize(tag) || 'Place'
}

function capitalize(s) {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function TMDBSearchModal({ onClose, onSave, loading }) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const { handleClose } = useModalAnimation(overlayRef, panelRef, onClose)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `${TMDB_API_BASE}/search/multi?query=${encodeURIComponent(query)}&api_key=${import.meta.env.VITE_TMDB_API_KEY}&include_adult=false`
        )
        const data = await res.json()
        const filtered = (data.results || [])
          .filter(r => (r.media_type === 'movie' || r.media_type === 'tv') && (r.title || r.name))
          .slice(0, 6)
        setResults(filtered)
      } catch (err) {
        console.error('TMDB search error:', err)
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  function handleSelect(r) {
    const title = r.title || r.name
    const year = (r.release_date || r.first_air_date || '').slice(0, 4)
    onSave({
      category: 'watchlist',
      title,
      description: r.overview ? r.overview.slice(0, 200) : null,
      link: null,
      tmdb_id: String(r.id),
      media_type: r.media_type,
      poster_path: r.poster_path || null,
      release_year: year ? parseInt(year, 10) : null,
      overview: r.overview || null,
    }, null, handleClose)
  }

  const inputStyle = {
    background: 'transparent', border: 'none',
    borderBottom: '1px solid var(--border-rule)',
    padding: '10px 0', fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)', color: 'var(--cream)', outline: 'none',
    letterSpacing: '-0.01em', width: '100%',
  }

  return (
    <div className="modal-overlay" onClick={handleClose} ref={overlayRef}>
      <div className="modal" onClick={e => e.stopPropagation()} ref={panelRef}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 20 }}>
          Search to add.
        </div>
        <input
          style={inputStyle}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Movie or TV show title…"
          autoFocus
        />
        {searching && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <div className="animate-spin" style={{ width: 22, height: 22, border: '1.5px solid var(--border-rule)', borderTopColor: 'var(--cream)', borderRadius: '50%' }} />
          </div>
        )}
        {!searching && results.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {results.map(r => {
              const title = r.title || r.name
              const year = (r.release_date || r.first_air_date || '').slice(0, 4)
              const color = posterColor(title)
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '8px 0', borderBottom: '1px solid var(--border)',
                    textAlign: 'left', width: '100%',
                  }}
                >
                  {r.poster_path ? (
                    <img
                      src={`${TMDB_IMAGE_BASE}${r.poster_path}`}
                      alt={title}
                      style={{ width: 40, height: 60, borderRadius: 3, objectFit: 'cover', flexShrink: 0, background: color }}
                    />
                  ) : (
                    <div style={{ width: 40, height: 60, borderRadius: 3, background: color, flexShrink: 0,
                      display: 'flex', alignItems: 'flex-end', padding: 3,
                      fontFamily: 'var(--font-display)', fontSize: 'var(--text-overline)', color: 'var(--cream-dim)', lineHeight: 1 }}>
                      {title.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', color: 'var(--cream)', lineHeight: 1.2 }}>{title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.18em', color: 'var(--cream-faint)', marginTop: 3, textTransform: 'uppercase' }}>
                      {r.media_type === 'tv' ? 'TV' : 'Film'}{year ? ` · ${year}` : ''}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
        {!searching && query.trim() && results.length === 0 && (
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-base)', color: 'var(--cream-faint)', padding: '20px 0' }}>
            No results for &ldquo;{query}&rdquo;.
          </div>
        )}
        <button type="button" className="btn-ghost" onClick={handleClose} style={{ marginTop: 20, width: '100%' }}>Cancel</button>
      </div>
    </div>
  )
}

// PLAC-01, PLAC-02, PLAC-03: Nominatim search modal
function NominatimSearchModal({ onClose, onSave, loading }) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const { handleClose } = useModalAnimation(overlayRef, panelRef, onClose)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)
  const lastFetchRef = useRef(0)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      // enforce 1 req/sec rate limit
      const now = Date.now()
      const wait = Math.max(0, 1000 - (now - lastFetchRef.current))
      await new Promise(r => setTimeout(r, wait))
      lastFetchRef.current = Date.now()

      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        setResults(data || [])
      } catch (err) {
        console.error('Nominatim search error:', err)
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  function handleSelect(r) {
    const name = r.name || r.display_name.split(',')[0]
    const address = r.display_name
    const category = getOsmCategory(r)
    onSave({
      category: 'places',
      title: name,
      description: category,
      link: null,
      osm_id: String(r.osm_id),
      osm_address: address,
      osm_category: category,
      osm_lat: r.lat,
      osm_lon: r.lon,
    }, null, handleClose)
  }

  const inputStyle = {
    background: 'transparent', border: 'none',
    borderBottom: '1px solid var(--border-rule)',
    padding: '10px 0', fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)', color: 'var(--cream)', outline: 'none',
    letterSpacing: '-0.01em', width: '100%',
  }

  return (
    <div className="modal-overlay" onClick={handleClose} ref={overlayRef}>
      <div className="modal" onClick={e => e.stopPropagation()} ref={panelRef}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 20 }}>
          Find a place.
        </div>
        <input
          style={inputStyle}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Restaurant, café, park…"
          autoFocus
        />
        {searching && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <div className="animate-spin" style={{ width: 22, height: 22, border: '1.5px solid var(--border-rule)', borderTopColor: 'var(--cream)', borderRadius: '50%' }} />
          </div>
        )}
        {!searching && results.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {results.map(r => {
              const name = r.name || r.display_name.split(',')[0]
              const address = r.display_name
              const category = getOsmCategory(r)
              return (
                <button
                  key={r.osm_id}
                  onClick={() => handleSelect(r)}
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '10px 0', borderBottom: '1px solid var(--border)',
                    textAlign: 'left', width: '100%',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                    background: 'var(--surface-raised)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent-soft)', fontSize: 'var(--text-base)',
                  }}>📍</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', color: 'var(--cream)', lineHeight: 1.2 }}>{name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.14em', color: 'var(--accent-soft)', marginTop: 2, textTransform: 'uppercase' }}>{category}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)', marginTop: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' }}>
                      {address}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
        {!searching && query.trim() && results.length === 0 && (
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-base)', color: 'var(--cream-faint)', padding: '20px 0' }}>
            No results for &ldquo;{query}&rdquo;.
          </div>
        )}
        <button type="button" className="btn-ghost" onClick={handleClose} style={{ marginTop: 20, width: '100%' }}>Cancel</button>
      </div>
    </div>
  )
}

// Notes edit modal for places
function PlaceNotesModal({ onClose, onSave, loading, initialNotes = '' }) {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const { handleClose } = useModalAnimation(overlayRef, panelRef, onClose)
  const [notes, setNotes] = useState(initialNotes)

  function submit(e) {
    e.preventDefault()
    onSave(notes.trim(), handleClose)
  }

  const fieldStyle = {
    background: 'transparent', border: 'none',
    borderBottom: '1px solid var(--border-rule)',
    padding: '10px 0', fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)', color: 'var(--cream)', outline: 'none',
    letterSpacing: '-0.01em', width: '100%',
    resize: 'none',
  }

  return (
    <div className="modal-overlay" onClick={handleClose} ref={overlayRef}>
      <div className="modal" onClick={e => e.stopPropagation()} ref={panelRef}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 20 }}>
          Personal notes.
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)', marginBottom: 6 }}>Notes</div>
            <textarea style={{ ...fieldStyle, minHeight: 80 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Great for date night, book ahead…" autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn-ghost" onClick={handleClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? '…' : 'Save notes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Interests() {
  const { session, profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('watchlist')
  const [showModal, setShowModal] = useState(false)
  const [, setEditData] = useState(null)
  const [adding, setAdding] = useState(false)
  const [profiles, setProfiles] = useState({})
  const [ratingsMap, setRatingsMap] = useState({})
  const [allRatings, setAllRatings] = useState([])
  const [suggestions, setSuggestions] = useState([])
  // Phase 4: places filter + notes editing
  const [placeFilter, setPlaceFilter] = useState('All')
  const [notesItem, setNotesItem] = useState(null) // item being notes-edited
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const [intRes, profRes, ratRes] = await Promise.all([
        supabase.from('interests').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name'),
        supabase.from('interest_ratings').select('id, interest_id, rating, would_rewatch, is_currently_watching').eq('user_id', session.user.id),
      ])
      if (intRes.error) throw intRes.error
      if (profRes.error) throw profRes.error
      setItems(intRes.data || [])
      const map = {}
      ;(profRes.data || []).forEach(p => { map[p.id] = p.full_name })
      setProfiles(map)
      const rMap = {}
      ;(ratRes.data || []).forEach(r => { rMap[r.interest_id] = r })
      setRatingsMap(rMap)
      const { data: allRatData } = await supabase
        .from('interest_ratings')
        .select('id, interest_id, user_id, rating, would_rewatch, is_currently_watching')
      setAllRatings(allRatData || [])
      fetchSuggestions(intRes.data || [], allRatData || [])
    } catch (err) {
      console.error('Error loading interests:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchSuggestions(interests, ratings) {
    const highRated = ratings
      .filter(r => r.rating >= 4)
      .map(r => r.interest_id)
    const highRatedItems = interests.filter(i => highRated.includes(i.id) && i.tmdb_id && i.media_type)
    const seen = new Set()
    const seeds = highRatedItems.filter(i => { if (seen.has(i.tmdb_id)) return false; seen.add(i.tmdb_id); return true }).slice(0, 3)
    if (seeds.length === 0) return

    const existingTmdbIds = new Set(interests.filter(i => i.tmdb_id).map(i => i.tmdb_id))

    const allSuggestions = []
    await Promise.all(seeds.map(async seed => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${seed.media_type}/${seed.tmdb_id}/recommendations?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        )
        const data = await res.json()
        const recs = (data.results || []).filter(r =>
          !existingTmdbIds.has(String(r.id)) && (r.title || r.name)
        ).slice(0, 4)
        allSuggestions.push(...recs.map(r => ({ ...r, media_type: seed.media_type })))
      } catch (err) {
        console.error('TMDB recommendations error:', err)
      }
    }))

    const dedupedSeen = new Set()
    const deduped = allSuggestions.filter(r => { if (dedupedSeen.has(r.id)) return false; dedupedSeen.add(r.id); return true }).slice(0, 6)
    setSuggestions(deduped)
  }

  async function upsertRating(interestId, patch) {
    const existing = ratingsMap[interestId]
    const payload = {
      user_id: session.user.id,
      interest_id: interestId,
      would_rewatch: existing?.would_rewatch ?? false,
      is_currently_watching: existing?.is_currently_watching ?? false,
      rating: existing?.rating ?? null,
      ...patch,
    }
    const { data, error } = await supabase
      .from('interest_ratings')
      .upsert(payload, { onConflict: 'user_id,interest_id' })
      .select('id, interest_id, rating, would_rewatch, is_currently_watching')
      .single()
    if (error) { console.error('upsertRating error:', error); return }
    setRatingsMap(prev => ({ ...prev, [interestId]: data }))
  }

  async function toggleCurrentlyWatching(interestId) {
    const current = ratingsMap[interestId]
    const isNowWatching = !(current?.is_currently_watching ?? false)
    if (isNowWatching) {
      const otherIds = allRatings.filter(r => r.user_id === session.user.id && r.is_currently_watching && r.interest_id !== interestId)
      for (const r of otherIds) {
        await supabase.from('interest_ratings')
          .upsert({ ...r, is_currently_watching: false }, { onConflict: 'user_id,interest_id' })
      }
      setAllRatings(prev => prev.map(r =>
        r.user_id === session.user.id && r.interest_id !== interestId
          ? { ...r, is_currently_watching: false }
          : r
      ))
    }
    await upsertRating(interestId, { is_currently_watching: isNowWatching })
    setAllRatings(prev => {
      const idx = prev.findIndex(r => r.interest_id === interestId && r.user_id === session.user.id)
      if (idx >= 0) return prev.map((r, i) => i === idx ? { ...r, is_currently_watching: isNowWatching } : r)
      return [...prev, { interest_id: interestId, user_id: session.user.id, is_currently_watching: isNowWatching }]
    })
  }

  async function saveWatchlistItem(data, _id, handleClose) {
    try {
      setAdding(true)
      const { error } = await supabase.from('interests').insert({
        ...data,
        added_by: session.user.id,
        unit_id: profile?.unit_id || null,
      })
      if (error) throw error
      handleClose()
      load()
    } catch (err) {
      console.error('Error saving watchlist item:', err)
    } finally {
      setAdding(false)
    }
  }

  // PLAC-02, PLAC-03: Save place from Nominatim search result
  async function savePlaceItem(data, _id, handleClose) {
    try {
      setAdding(true)
      const { error } = await supabase.from('interests').insert({
        category: 'places',
        title: data.title,
        description: data.osm_category || data.description || null,
        link: null,
        added_by: session.user.id,
        unit_id: profile?.unit_id || null,
        // Store OSM data in description and overview fields
        overview: JSON.stringify({
          address: data.osm_address,
          category: data.osm_category,
          lat: data.osm_lat,
          lon: data.osm_lon,
          osm_id: data.osm_id,
        }),
      })
      if (error) throw error
      handleClose()
      load()
    } catch (err) {
      console.error('Error saving place:', err)
      alert(`Failed to save: ${err.message}`)
    } finally {
      setAdding(false)
    }
  }

  // PLAC-05: Save personal notes on a place
  async function savePlaceNotes(itemId, notes, handleClose) {
    try {
      setSavingNotes(true)
      // Store notes in the `link` field (repurposed for notes in places context)
      const { error } = await supabase.from('interests').update({
        link: notes || null,
      }).eq('id', itemId)
      if (error) throw error
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, link: notes || null } : i))
      handleClose()
    } catch (err) {
      console.error('Error saving notes:', err)
    } finally {
      setSavingNotes(false)
    }
  }

  async function deleteItem(id) {
    await supabase.from('interests').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const filtered = items.filter(i => i.category === tab)

  // PLAC-07: category filter for places
  const placeCategories = ['All', ...Array.from(new Set(
    items.filter(i => i.category === 'places').map(i => i.description).filter(Boolean)
  ))]
  const filteredPlaces = tab === 'places'
    ? filtered.filter(i => placeFilter === 'All' || i.description === placeFilter)
    : filtered

  return (
    <div style={{ paddingTop: 16 }}>
      {showModal && tab === 'watchlist' && (
        <TMDBSearchModal onClose={() => setShowModal(false)} onSave={saveWatchlistItem} loading={adding} />
      )}
      {showModal && tab === 'places' && (
        <NominatimSearchModal onClose={() => setShowModal(false)} onSave={savePlaceItem} loading={adding} />
      )}
      {notesItem && (
        <PlaceNotesModal
          onClose={() => setNotesItem(null)}
          onSave={(notes, handleClose) => savePlaceNotes(notesItem.id, notes, handleClose)}
          loading={savingNotes}
          initialNotes={notesItem.link || ''}
        />
      )}

      <Masthead title="Interests" meta="Shared · 2 hosts" />

      <div style={{ marginTop: 18 }}>
        <Kicker>The list</Kicker>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 10vw, 44px)',
          lineHeight: 0.95, margin: '8px 0 0', letterSpacing: '-0.025em', color: 'var(--cream)',
        }}>
          Things to <span style={{ fontStyle: 'italic', color: 'var(--accent-soft)' }}>watch</span> and<br />
          places to <span style={{ fontStyle: 'italic', color: 'var(--accent-soft)' }}>go.</span>
        </h1>
      </div>

      <PillNav />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
        {[
          { id: 'watchlist', label: 'Watchlist', count: items.filter(i => i.category === 'watchlist').length },
          { id: 'places', label: 'Places', count: items.filter(i => i.category === 'places').length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 16px', borderRadius: 999,
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600,
            cursor: 'pointer', letterSpacing: '-0.01em',
            border: tab === t.id ? 'none' : '1px solid var(--border-rule)',
            background: tab === t.id ? 'var(--cream)' : 'transparent',
            color: tab === t.id ? 'var(--primary-fg)' : 'var(--cream)',
          }}>
            {t.label}{' '}
            <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.5, fontSize: 'var(--text-overline)' }}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* PLAC-07: Category filter for places */}
      {tab === 'places' && placeCategories.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {placeCategories.map(cat => (
            <button key={cat} onClick={() => setPlaceFilter(cat)} style={{
              padding: '5px 12px', borderRadius: 999, flexShrink: 0,
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.14em', textTransform: 'uppercase',
              cursor: 'pointer',
              border: placeFilter === cat ? 'none' : '1px solid var(--border-rule)',
              background: placeFilter === cat ? 'var(--accent-soft)' : 'transparent',
              color: placeFilter === cat ? 'var(--primary-fg)' : 'var(--cream-faint)',
            }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Currently Watching (watchlist only) */}
      {(() => {
        const cwItems = tab === 'watchlist'
          ? allRatings
              .filter(r => r.is_currently_watching)
              .map(r => {
                const interest = items.find(i => i.id === r.interest_id)
                if (!interest) return null
                return { ...interest, watcherName: profiles[r.user_id]?.split(' ')[0] || '?', watcherIsMe: r.user_id === session?.user?.id }
              })
              .filter(Boolean)
          : []
        return tab === 'watchlist' && cwItems.length > 0 ? (
          <div style={{ marginTop: 20 }}>
            <SectionRule label="00 — Currently watching" />
            <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {cwItems.map(cw => {
                const color = posterColor(cw.title || '')
                return (
                  <div key={cw.id} style={{ flexShrink: 0, width: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    {cw.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w200${cw.poster_path}`} alt={cw.title}
                        style={{ width: 72, height: 108, objectFit: 'cover', borderRadius: 6, boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }} />
                    ) : (
                      <div style={{ width: 72, height: 108, background: color, borderRadius: 6, boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'flex-end', padding: 5,
                        fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', color: 'var(--cream-dim)', lineHeight: 1 }}>
                        {cw.title?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-overline)', color: 'var(--cream)', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                      {cw.watcherName}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)', textAlign: 'center', lineHeight: 1.2,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cw.title}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null
      })()}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="animate-spin" style={{ width: 28, height: 28, border: '1.5px solid var(--border-rule)', borderTopColor: 'var(--cream)', borderRadius: '50%' }} />
        </div>
      ) : (
        <div style={{ marginTop: 24 }}>
          <SectionRule label={`01 — ${tab === 'watchlist' ? 'On the watchlist' : 'On the map'}`} />

          {filteredPlaces.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-xl)', color: 'var(--cream-faint)', marginBottom: 16 }}>
                Nothing here yet.
              </div>
              <button className="btn-primary" onClick={() => { setEditData(null); setShowModal(true) }}>
                Add one now
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 14 }}>
              {filteredPlaces.map((item, i) => (
                tab === 'watchlist'
                  ? <WatchRow
                      key={item.id}
                      item={item}
                      profiles={profiles}
                      myId={session?.user?.id}
                      myRating={ratingsMap[item.id] || null}
                      onRate={(rating) => upsertRating(item.id, { rating })}
                      onToggleRewatch={() => upsertRating(item.id, { would_rewatch: !(ratingsMap[item.id]?.would_rewatch ?? false) })}
                      isCW={ratingsMap[item.id]?.is_currently_watching ?? false}
                      onToggleCW={() => toggleCurrentlyWatching(item.id)}
                      isLast={i === filteredPlaces.length - 1}
                      onDelete={() => deleteItem(item.id)}
                    />
                  : <PlaceRow
                      key={item.id}
                      item={item}
                      profiles={profiles}
                      myId={session?.user?.id}
                      isLast={i === filteredPlaces.length - 1}
                      onEditNotes={() => setNotesItem(item)}
                      onDelete={() => deleteItem(item.id)}
                    />
              ))}
            </div>
          )}

          {tab === 'watchlist' && suggestions.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <SectionRule label="02 — You might like" />
              <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto', paddingBottom: 8 }}>
                {suggestions.map(s => {
                  const title = s.title || s.name
                  const year = (s.release_date || s.first_air_date || '').slice(0, 4)
                  const color = posterColor(title)
                  return (
                    <div key={s.id} style={{ flexShrink: 0, width: 90 }}>
                      {s.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w200${s.poster_path}`} alt={title}
                          style={{ width: 72, height: 108, objectFit: 'cover', borderRadius: 6, boxShadow: '0 4px 14px rgba(0,0,0,0.4)', display: 'block' }} />
                      ) : (
                        <div style={{ width: 72, height: 108, background: color, borderRadius: 6, boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                          display: 'flex', alignItems: 'flex-end', padding: 5,
                          fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', color: 'var(--cream-dim)', lineHeight: 1 }}>
                          {title?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', color: 'var(--cream)', lineHeight: 1.2, marginTop: 6,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {title}
                      </div>
                      {year && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', color: 'var(--cream-faint)', letterSpacing: '0.12em', marginTop: 2 }}>{year}</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setEditData(null); setShowModal(true) }}
        style={{
          position: 'fixed',
          bottom: 'calc(92px + env(safe-area-inset-bottom))',
          right: 20,
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(154,129,116,0.35)',
          transition: 'transform 150ms var(--ease-spring)',
          zIndex: 40,
        }}
      >
        <PlusIcon size={22} stroke={2} />
      </button>
    </div>
  )
}

// ─── Row components ───────────────────────────────────────────────────────────

function WatchRow({ item, profiles, myId, isLast, onDelete, myRating, onRate, onToggleRewatch, isCW, onToggleCW }) {
  const addedByMe = item.added_by === myId
  const adderName = profiles[item.added_by]?.split(' ')[0] || '?'
  const initials = adderName[0]?.toUpperCase() || '?'
  const color = posterColor(item.title || '')

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '52px 1fr auto auto', gap: 12, alignItems: 'start',
      padding: '10px 0', borderBottom: isLast ? 'none' : '1px solid var(--border)',
    }}>
      {item.poster_path ? (
        <img
          src={`${TMDB_IMAGE_BASE}${item.poster_path}`}
          alt={item.title}
          style={{ width: 52, aspectRatio: '2 / 3', borderRadius: 4, objectFit: 'cover', boxShadow: '0 4px 10px -4px rgba(0,0,0,0.5)' }}
        />
      ) : (
        <div style={{
          width: 52, aspectRatio: '2 / 3',
          background: color, borderRadius: 4,
          display: 'flex', alignItems: 'flex-end', padding: 4,
          color: 'var(--cream-dim)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-overline)',
          letterSpacing: '-0.01em', lineHeight: 1,
          boxShadow: '0 4px 10px -4px rgba(0,0,0,0.5)',
        }}>
          {item.title?.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--cream)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          {item.title}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
          {item.media_type && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              {item.media_type === 'tv' ? 'TV' : 'Film'}{item.release_year ? ` · ${item.release_year}` : ''}
            </span>
          )}
          {!item.media_type && item.description && <span>{item.description}</span>}
          {item.link && /^https?:\/\//i.test(item.link) && <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-soft)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Link ↗</a>}
        </div>
        {/* Star rating row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              onClick={() => onRate(star === myRating?.rating ? null : star)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 1,
                color: (myRating?.rating ?? 0) >= star ? 'var(--accent-soft)' : 'var(--border)',
                fontSize: 'var(--text-sm)', lineHeight: 1,
              }}
            >★</button>
          ))}
          <button
            onClick={onToggleRewatch}
            style={{
              border: 'none', cursor: 'pointer', padding: '2px 7px',
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.14em',
              textTransform: 'uppercase', borderRadius: 999,
              marginLeft: 4,
              color: myRating?.would_rewatch ? 'var(--accent-soft)' : 'var(--cream-faint)',
              background: myRating?.would_rewatch ? 'rgba(154,129,116,0.15)' : 'none',
              boxShadow: myRating?.would_rewatch ? '0 0 8px 1px rgba(154,129,116,0.45)' : 'none',
              transition: 'box-shadow 200ms ease, background 200ms ease, color 200ms ease',
            }}
          >↺ rewatch</button>
          <button
            onClick={onToggleCW}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: isCW ? 'var(--accent)' : 'var(--cream-faint)',
              borderLeft: '1px solid var(--border)', paddingLeft: 6, marginLeft: 2,
            }}
          >👁</button>
        </div>
      </div>
      <InitialsAvatar initials={initials} isMe={addedByMe} size={22} />
      {addedByMe && (
        <button onClick={onDelete} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.6 }}>
          <XIcon size={13} />
        </button>
      )}
    </div>
  )
}

// PLAC-04, PLAC-05, PLAC-06: Enhanced PlaceRow with OSM data, notes, delete
function PlaceRow({ item, profiles, myId, isLast, onEditNotes, onDelete }) {
  const addedByMe = item.added_by === myId
  const adderName = profiles[item.added_by]?.split(' ')[0] || '?'
  const initials = adderName[0]?.toUpperCase() || '?'

  // Parse OSM data stored in overview field
  let osmData = null
  try {
    if (item.overview) osmData = JSON.parse(item.overview)
  } catch { /* not JSON — ignore */ }

  const category = item.description || 'Place'
  const address = osmData?.address || null
  const notes = item.link || null // notes stored in link field

  return (
    <div style={{
      padding: '12px 0', borderBottom: isLast ? 'none' : '1px solid var(--border)',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '44px 1fr auto auto', gap: 12, alignItems: 'start',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 999,
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent-soft)',
          flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--cream)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            {item.title}
          </div>
          {/* PLAC-03: category tag */}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-soft)', marginTop: 2 }}>
            {category}
          </div>
          {/* PLAC-04: address */}
          {address && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--cream-faint)', marginTop: 3, lineHeight: 1.4 }}>
              {address.length > 80 ? address.slice(0, 80) + '…' : address}
            </div>
          )}
          {/* PLAC-04: personal notes */}
          {notes && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--cream)', marginTop: 5, fontStyle: 'italic', lineHeight: 1.4,
              padding: '4px 8px', background: 'var(--surface-raised)', borderRadius: 6, borderLeft: '2px solid var(--accent-soft)' }}>
              {notes}
            </div>
          )}
        </div>
        <InitialsAvatar initials={initials} isMe={addedByMe} size={22} />
        {addedByMe && (
          <button onClick={onDelete} style={{ color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.6 }}>
            <XIcon size={13} />
          </button>
        )}
      </div>
      {/* PLAC-05: notes edit button */}
      <div style={{ paddingLeft: 56, marginTop: 6 }}>
        <button onClick={onEditNotes} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-overline)', letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--cream-faint)', padding: 0,
        }}>
          {notes ? 'Edit notes →' : '+ Add notes'}
        </button>
      </div>
    </div>
  )
}
