# Personal Canvas Page

A simple, password-protected canvas page using Excalidraw with automatic persistence to Supabase.

## Features

✅ **Single Persistent Canvas** - One canvas that remembers all your drawings
✅ **Password Protected** - Login required to access
✅ **Auto-Save** - Automatically saves 2 seconds after you stop drawing
✅ **Manual Save** - "Save Now" button for immediate save
✅ **Last Saved Indicator** - Shows when your canvas was last saved
✅ **Clean Interface** - Full-screen canvas with minimal header
✅ **Session-Based Auth** - Stays logged in during your browser session

## Access

**URL:** `/canvas`

**Password:** Same as admin password (set in `.env.local`)

## How It Works

### Auto-Save
- Canvas automatically saves **2 seconds** after you stop drawing
- No need to manually save (but you can!)
- Shows "Saving..." indicator in header

### Data Storage
- Saves to Supabase `canvas_data` table
- Uses a fixed canvas name: `main-canvas`
- Only one canvas per deployment
- Loads automatically on login

### Authentication
- Simple password protection
- Session-based (logged in until browser close)
- Same password as `/admin` page
- Saves canvas before logout

## Usage

1. **Login**
   - Visit `/canvas`
   - Enter your password
   - Click "Login"

2. **Draw**
   - Use Excalidraw tools to draw
   - Changes auto-save after 2 seconds
   - Or click "Save Now" to save immediately

3. **Come Back Later**
   - Your canvas is saved in Supabase
   - Login again to see your previous work
   - All drawings persist across sessions

## Technical Details

### Canvas Data Structure
```typescript
{
  name: 'main-canvas',
  description: 'Main persistent canvas',
  canvas_data: {
    elements: [...],  // All drawing elements
    appState: {       // Canvas state
      viewBackgroundColor,
      currentItemStrokeColor,
      currentItemBackgroundColor,
      gridSize
    }
  }
}
```

### Save Behavior
- **Debounced**: Waits 2 seconds of inactivity before saving
- **On Logout**: Saves immediately when you click logout
- **Manual**: "Save Now" button triggers immediate save

### Database
Uses the same `canvas_data` table as admin dashboard:
- ✅ Already created if you ran the SQL migrations
- ✅ No additional setup needed

## Differences from Admin Page

| Feature | Admin Page | Canvas Page |
|---------|-----------|-------------|
| Multiple Canvases | ✅ Yes | ❌ No (single canvas) |
| Save/Load UI | ✅ Sidebar | ❌ Auto-save only |
| Canvas Names | ✅ Custom names | ❌ Fixed: "main-canvas" |
| List View | ✅ Yes | ❌ No |
| Purpose | Manage multiple canvases | One persistent canvas |

## Use Cases

Perfect for:
- 📝 **Personal Whiteboard** - Quick sketches and notes
- 🎨 **Ongoing Project** - Work on one large canvas over time
- 🗺️ **Mind Map** - Build a persistent mind map
- 📊 **Planning Canvas** - Project planning and brainstorming
- 📐 **Design Work** - Ongoing design iterations

## Configuration

### Environment Variables
Uses the same variables as admin page:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_ADMIN_PASSWORD=your_password
```

### Customization
Want to customize? Edit `/src/app/canvas/page.tsx`:

**Change auto-save delay:**
```typescript
// Change 2000 (2 seconds) to your preference
setTimeout(() => {
  saveCanvas(elements, appState)
}, 2000)  // ← Change this number (milliseconds)
```

**Use different canvas name:**
```typescript
// Change 'main-canvas' to your preferred name
.eq('name', 'main-canvas')  // ← Change this
```

**Different password:**
```typescript
// Use a different password than admin
const canvasPassword = process.env.NEXT_PUBLIC_CANVAS_PASSWORD || 'default'
```

## Tips

### For Best Experience
- 💾 **Manual Save**: Click "Save Now" before important breaks
- 🔄 **Refresh**: Reload page if you want to verify save worked
- 🚪 **Logout**: Always logout when done (auto-saves first)
- 📱 **Browser**: Works best on desktop browsers
- 🌐 **Internet**: Requires internet for auto-save to work

### Keyboard Shortcuts
Excalidraw includes many shortcuts:
- **Ctrl+Z / Cmd+Z** - Undo
- **Ctrl+Y / Cmd+Y** - Redo
- **Ctrl+S / Cmd+S** - Would normally save (we auto-save!)
- **V** - Selection tool
- **R** - Rectangle
- **D** - Diamond
- **O** - Ellipse
- **A** - Arrow
- **L** - Line
- **T** - Text
- **P** - Pen (freehand)

See [Excalidraw docs](https://docs.excalidraw.com) for more shortcuts.

## Troubleshooting

### Canvas not saving
- Check Supabase credentials in `.env.local`
- Verify SQL migrations were run
- Check browser console for errors
- Try manual "Save Now" button

### Can't login
- Verify `NEXT_PUBLIC_ADMIN_PASSWORD` is set
- Clear session: `sessionStorage.clear()` in console
- Restart dev server after changing `.env.local`

### Canvas not loading
- Check that `canvas_data` table exists in Supabase
- Verify you ran `01_create_tables.sql`
- Check browser console for errors

### Lost my drawings
- Check Supabase dashboard → Table Editor → canvas_data
- Look for row with `name = 'main-canvas'`
- The `canvas_data` column contains your drawings

## Deployment on Vercel

Works perfectly on Vercel! Just:

1. ✅ Push code to GitHub
2. ✅ Import project to Vercel
3. ✅ Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
4. ✅ Deploy!

Your canvas will be available at: `your-domain.vercel.app/canvas`

## Future Enhancements

Ideas for extending this page:
- [ ] Export canvas as PNG/SVG
- [ ] Dark mode toggle
- [ ] Canvas history/versions
- [ ] Share canvas with view-only link
- [ ] Multiple named canvases (dropdown)
- [ ] Offline mode with sync
- [ ] Keyboard shortcuts overlay
- [ ] Mobile responsive design

---

**Enjoy your personal persistent canvas! 🎨**
