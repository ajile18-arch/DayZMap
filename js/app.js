// DayZ Chernarus Tactical Map Controller (Reference: DayZ.xam.nu)
(function() {
  const MAP_SIZE = 15360; // Chernarus 15360m x 15360m
  let map, currentLayer = 'topo', rulerLine = null, rulerMarkers = [];
  let isRulerActive = false;
  let isAddWaypointMode = false;
  // Default active categories: Only Cities & Towns active by default
  let activeCategories = new Set(['towns']);
  let markersLayer = L.layerGroup();
  let userWaypointsLayer = L.layerGroup();
  let buddyLayer = L.layerGroup();
  let buddyLine = null;
  let isBuddyMode = false;
  let buddyPins = [];
  let meetupLayer = L.layerGroup();
  let meetupLines = [];
  let isMeetupMode = false;
  let meetupPins = [];
  let squadClient = null;
  let squadRoomCode = localStorage.getItem('dayz_squad_room') || '';
  let squadCallsign = localStorage.getItem('dayz_squad_callsign') || `Player-${Math.floor(100 + Math.random() * 900)}`;
  let squadSenderId = 'uid_' + Math.random().toString(36).substring(2, 10);
  let squadPeers = {};
  let isApplyingSquadSync = false;
  let playerLocation = JSON.parse(localStorage.getItem('dayz_player_location') || 'null');
  let selectedClosestCategory = null;
  let closestTargetLoc = null;

  // Custom DayZ Chernarus Tile Pyramid Coordinate Reference System
  // Maps 15360m x 15360m in-game world directly to slippy map raster tiles
  // (0,0) is Southwest ocean, (15360, 15360) is Northeast border
  const DayZCRS = L.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(1 / 60, 0, -1 / 60, 256)
  });

  // DayZ Coordinate Transformation
  function toLatLng(x, y) {
    return L.latLng(y, x);
  }

  function fromLatLng(latlng) {
    return {
      x: Math.round(Math.max(0, Math.min(MAP_SIZE, latlng.lng))),
      y: Math.round(Math.max(0, Math.min(MAP_SIZE, latlng.lat)))
    };
  }

  function formatCoord(val) {
    return String(val).padStart(5, '0');
  }

  function formatGrid(x, y) {
    const gx = String(Math.floor(x / 100)).padStart(3, '0');
    const gy = String(Math.floor(y / 100)).padStart(3, '0');
    return `${gx} ${gy}`;
  }

  // --- INIT MAP ---
  function getDefaultFitZoom() {
    if (!map) return 0;
    const size = map.getSize();
    const minDim = Math.min(size.x || window.innerWidth, size.y || window.innerHeight);
    const exactZoom = Math.log2(Math.max(256, minDim) / 256);
    return Math.max(0, Math.min(3, Math.round(exactZoom * 100) / 100));
  }

  function alignToolbarAboveMap() {
    if (!map) return;
    const toolsEl = document.querySelector('.tactical-floating-tools');
    if (!toolsEl) return;

    const topEdgePx = map.latLngToContainerPoint(toLatLng(7680, MAP_SIZE)).y;
    const toolbarHeight = toolsEl.offsetHeight || 46;
    const targetTop = Math.max(82, Math.round(topEdgePx - toolbarHeight - 10));
    toolsEl.style.top = `${targetTop}px`;

    const subHudTop = `${targetTop + toolbarHeight + 10}px`;
    const measureHud = document.getElementById('measure-hud');
    const buddyHud = document.getElementById('buddy-hud');
    const squadModal = document.getElementById('squad-modal');
    if (measureHud) measureHud.style.top = subHudTop;
    if (buddyHud) buddyHud.style.top = subHudTop;
    if (squadModal) squadModal.style.top = subHudTop;
  }

  function centerMapToScreenEdge() {
    if (!map) return;
    const fitZoom = getDefaultFitZoom();
    map.options.minZoom = fitZoom;
    map.setView([7680, 7680], fitZoom);
    alignToolbarAboveMap();
  }

  function initMap() {
    map = L.map('map', {
      crs: DayZCRS,
      minZoom: 0,
      maxZoom: 7,
      zoomSnap: 0.05,
      zoomDelta: 0.5,
      attributionControl: false,
      maxBounds: [[-1000, -1000], [MAP_SIZE + 1000, MAP_SIZE + 1000]],
      maxBoundsViscosity: 0.8
    });

    // High-res Topographic Layer with Full Building Outlines (Zoom 0-7)
    // Loads directly from local disk first, with graceful fallback
    const HybridTopoLayer = L.TileLayer.extend({
      getTileUrl: function(coords) {
        return `./tiles/topographic/${coords.z}/${coords.x}/${coords.y}.webp`;
      }
    });

    const xamTopoLayer = new HybridTopoLayer('', {
      minZoom: 0,
      maxZoom: 7,
      maxNativeZoom: 7,
      noWrap: true,
      errorTileUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="%23161c18"/><text x="128" y="130" fill="%234a6250" font-family="monospace" font-size="12" text-anchor="middle">DAYZ CHERNARUS</text></svg>'
    });

    // High-res Satellite Aerial Imagery Layer (Zoom 0-7)
    const xamSatLayer = L.tileLayer('https://static.xam.nu/dayz/maps/chernarusplus/1.27/satellite/{z}/{x}/{y}.webp', {
      minZoom: 0,
      maxZoom: 7,
      maxNativeZoom: 7,
      noWrap: true
    });

    // Default layer: high-detail topographic map
    xamTopoLayer.addTo(map);
    currentLayer = 'topo';

    // Layer switch buttons (Topographic & Satellite)
    document.getElementById('btn-layer-topo').addEventListener('click', () => {
      map.removeLayer(xamSatLayer);
      if (!map.hasLayer(xamTopoLayer)) xamTopoLayer.addTo(map);
      currentLayer = 'topo';
      if (rulerLine) rulerLine.setStyle({ color: '#000000', weight: 4 });
      if (buddyLine) buddyLine.setStyle({ color: '#000000', weight: 4 });
      meetupLines.forEach(l => l.setStyle({ color: '#000000', weight: 4 }));
      updateLayerPills();
    });

    document.getElementById('btn-layer-sat').addEventListener('click', () => {
      map.removeLayer(xamTopoLayer);
      if (!map.hasLayer(xamSatLayer)) xamSatLayer.addTo(map);
      currentLayer = 'sat';
      if (rulerLine) rulerLine.setStyle({ color: '#26c6da', weight: 4 });
      if (buddyLine) buddyLine.setStyle({ color: '#ffb300', weight: 4 });
      meetupLines.forEach(l => l.setStyle({ color: '#7cb342', weight: 4 }));
      updateLayerPills();
    });

    // Add marker groups
    markersLayer.addTo(map);
    userWaypointsLayer.addTo(map);
    buddyLayer.addTo(map);
    meetupLayer.addTo(map);

    // Initial View: Fit the 15360x15360 map edge-to-edge to the screen width/height
    centerMapToScreenEdge();
    window.addEventListener('resize', () => {
      alignToolbarAboveMap();
    });

    // Render Data Markers
    renderMarkers();
    renderUserWaypoints();
    setupEvents();
    populateFiltersGrid();
    updateLayerPills();
    
    const badge = document.getElementById('poi-total-badge');
    if (badge) badge.innerText = markersLayer.getLayers().length;
  }

  function updateLayerPills() {
    ['topo', 'sat'].forEach(type => {
      const btn = document.getElementById(`btn-layer-${type}`);
      if (btn) btn.classList.toggle('active', currentLayer === type);
    });
  }

  function updatePinPlacementLock() {
    const canSetPin = isAddWaypointMode || isRulerActive || isBuddyMode || isMeetupMode;
    document.body.classList.toggle('pin-placement-active', Boolean(canSetPin));
    if (canSetPin && map) {
      map.closePopup();
    }
  }

  // --- MARKERS RENDERING ---
  function renderMarkers() {
    markersLayer.clearLayers();
    let closestMarkerInstance = null;

    DAYZ_DATA.locations.forEach(loc => {
      const isClosestMatch = closestTargetLoc && closestTargetLoc.id === loc.id;
      if (!activeCategories.has(loc.type) && !isClosestMatch) return;

      const cat = DAYZ_DATA.categories[loc.type] || { icon: "📍", color: "#fff" };
      const latlng = toLatLng(loc.x, loc.y);

      // Create Custom HTML Marker Icon
      let marker;
      if (loc.type === 'towns' && !isClosestMatch) {
        const townIcon = L.divIcon({
          className: 'dayz-town-icon-wrap',
          html: `<div class="dayz-town-label">${loc.en}<span>${loc.name}</span></div>`,
          iconSize: [80, 24],
          iconAnchor: [40, 12]
        });
        marker = L.marker(latlng, { icon: townIcon });
      } else {
        const borderStyle = isClosestMatch ? 'border: 2px solid #26c6da; box-shadow: 0 0 12px #26c6da; transform: scale(1.2);' : `border-color:${cat.color};`;
        const customIcon = L.divIcon({
          className: 'dayz-poi-wrap',
          html: `<div class="dayz-marker-icon" style="${borderStyle} color:${cat.color};">${cat.icon}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        marker = L.marker(latlng, { icon: customIcon });
      }

      // Popup Content
      let distInfo = '';
      if (playerLocation) {
        const dx = loc.x - playerLocation.x;
        const dy = loc.y - playerLocation.y;
        const dist = Math.round(Math.hypot(dx, dy));
        let bearing = Math.round(Math.atan2(dx, dy) * (180 / Math.PI));
        if (bearing < 0) bearing += 360;
        const card = getCardinalDirection(bearing);
        const walkStr = formatTravelTime(Math.round(dist / 4.0));
        const runStr = formatTravelTime(Math.round(dist / 6.5));
        distInfo = `
          <div style="color:#26c6da; font-family:var(--font-mono); font-size:11px; font-weight:bold; margin-bottom:4px;">📍 ${dist} m • ${card} (${bearing}°) from My Location</div>
          <div style="color:#b0bec5; font-family:var(--font-mono); font-size:10px; margin-bottom:6px;">🚶 Walk Time: <b style="color:#fff;">${walkStr}</b> &nbsp;|&nbsp; 🏃 Run Time: <b style="color:#fff;">${runStr}</b></div>
        `;
      }

      const popupHtml = `
        <div class="popup-container">
          <div class="popup-header">
            <div class="popup-title">${loc.en}</div>
            <div class="popup-subtitle">${loc.name}</div>
            ${loc.tier ? `<span class="popup-tier">TIER ${loc.tier}</span>` : ''}
          </div>
          ${distInfo}
          <div class="popup-body">${loc.desc || cat.name}</div>
          <div class="popup-coords-row">
            <span>GRID ${formatGrid(loc.x, loc.y)}</span>
            <span style="color:#7cb342;">X:${formatCoord(loc.x)} Y:${formatCoord(loc.y)}</span>
          </div>
          <button class="popup-btn" onclick="window.dayzApp.startRulerFrom(${loc.x}, ${loc.y}, '${loc.en.replace(/'/g, "\\'")}')">
            📏 Measure From Here
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayer.addLayer(marker);
      if (isClosestMatch) {
        closestMarkerInstance = marker;
      }
    });

    const badge = document.getElementById('poi-total-badge');
    if (badge) badge.innerText = markersLayer.getLayers().length;

    if (closestMarkerInstance) {
      setTimeout(() => closestMarkerInstance.openPopup(), 250);
    }
  }

  // --- PLAYER CURRENT LOCATION ("THIS IS MY LOCATION") ---
  function renderUserWaypoints() {
    userWaypointsLayer.clearLayers();
    const pinBtn = document.getElementById('btn-add-pin');
    if (pinBtn) {
      pinBtn.classList.toggle('active', Boolean(playerLocation || isAddWaypointMode));
    }

    const listEl = document.getElementById('waypoints-list-el');
    if (!listEl) return;

    listEl.innerHTML = '';

    if (!playerLocation) {
      listEl.innerHTML = '<div class="empty-state">Player location not set.<br>Tap the 📍 button on the right, then tap anywhere on the map to mark your current location.</div>';
      return;
    }

    const latlng = toLatLng(playerLocation.x, playerLocation.y);
    const icon = L.divIcon({
      className: 'player-loc-icon',
      html: `
        <div class="player-loc-beacon">
          <div class="player-loc-label">MY LOCATION</div>
          <div class="player-loc-pulse"></div>
          <div class="player-loc-dot">📍</div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const marker = L.marker(latlng, { icon: icon, draggable: true, zIndexOffset: 9000 });
    marker.on('dragend', (e) => {
      const coords = fromLatLng(e.target.getLatLng());
      setPlayerLocation(coords.x, coords.y);
    });

    marker.bindPopup(`
      <div class="popup-container">
        <div class="popup-header">
          <div class="popup-title">📍 My Current Location</div>
          <div class="popup-subtitle">Drag pin or use 📍 button to update</div>
        </div>
        <div class="popup-coords-row">
          <span>X:${formatCoord(playerLocation.x)} Y:${formatCoord(playerLocation.y)}</span>
          <span>GRID ${formatGrid(playerLocation.x, playerLocation.y)}</span>
        </div>
        <button class="popup-btn" onclick="window.dayzApp.startRulerFrom(${playerLocation.x}, ${playerLocation.y}, 'My Location')" style="margin-bottom:6px;">
          📏 Measure From My Location
        </button>
        <button class="popup-btn" onclick="window.dayzApp.deleteWaypoint()" style="background:#d32f2f;">
          🗑️ Clear My Location
        </button>
      </div>
    `);
    userWaypointsLayer.addLayer(marker);

    // Drawer Card
    const card = document.createElement('div');
    card.className = 'waypoint-card';
    card.innerHTML = `
      <div>
        <h5>📍 My Current Location</h5>
        <p>X:${formatCoord(playerLocation.x)} Y:${formatCoord(playerLocation.y)} | Grid: ${formatGrid(playerLocation.x, playerLocation.y)}</p>
      </div>
      <div class="waypoint-actions">
        <button class="waypoint-btn" onclick="window.dayzApp.flyToCoords(${playerLocation.x}, ${playerLocation.y})" title="Center on My Location">🎯</button>
        <button class="waypoint-btn" onclick="window.dayzApp.startRulerFrom(${playerLocation.x}, ${playerLocation.y}, 'My Location')" title="Measure From Here">📏</button>
        <button class="waypoint-btn del" onclick="window.dayzApp.deleteWaypoint()" title="Clear Location">✕</button>
      </div>
    `;
    listEl.appendChild(card);
  }

  function findClosestByCategory(categoryKey) {
    if (!playerLocation) return null;
    const candidates = DAYZ_DATA.locations.filter(l => l.type === categoryKey);
    if (candidates.length === 0) return null;

    let bestLoc = null;
    let minDist = Infinity;
    candidates.forEach(loc => {
      const d = Math.hypot(loc.x - playerLocation.x, loc.y - playerLocation.y);
      if (d < minDist) {
        minDist = d;
        bestLoc = loc;
      }
    });
    return bestLoc ? { loc: bestLoc, distance: Math.round(minDist) } : null;
  }

  function routeToClosestTarget(shouldFly = true) {
    if (!playerLocation || !closestTargetLoc) {
      if (!isRulerActive) {
        clearRuler();
        document.getElementById('measure-hud').style.display = 'none';
      }
      renderMarkers();
      return;
    }

    renderMarkers();

    // Draw tactical route line and show Distance / Direction / Walk Time / Run Time HUD from My Location
    clearRuler();
    const p1 = toLatLng(playerLocation.x, playerLocation.y);
    const p2 = toLatLng(closestTargetLoc.x, closestTargetLoc.y);

    rulerLine = L.polyline([p1, p2], {
      color: currentLayer === 'topo' ? '#000000' : '#26c6da',
      weight: 4,
      dashArray: '8, 6'
    }).addTo(map);

    const dx = closestTargetLoc.x - playerLocation.x;
    const dy = closestTargetLoc.y - playerLocation.y;
    const distance = Math.round(Math.hypot(dx, dy));

    let bearing = Math.round(Math.atan2(dx, dy) * (180 / Math.PI));
    if (bearing < 0) bearing += 360;
    const card = getCardinalDirection(bearing);

    const walkStr = formatTravelTime(Math.round(distance / 4.0));
    const runStr = formatTravelTime(Math.round(distance / 6.5));

    document.getElementById('ruler-dist').innerText = distance > 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance} m`;
    document.getElementById('ruler-bearing').innerText = `${card} (${bearing}°)`;
    document.getElementById('ruler-walk').innerText = walkStr;
    document.getElementById('ruler-time').innerText = runStr;
    document.getElementById('measure-hud').style.display = 'flex';

    if (shouldFly) {
      const bounds = L.latLngBounds([p1, p2]);
      map.flyToBounds(bounds, { padding: [70, 70], maxZoom: 5.5, duration: 1.0 });
    }
  }

  function setPlayerLocation(x, y) {
    playerLocation = { x, y, updated: Date.now() };
    localStorage.setItem('dayz_player_location', JSON.stringify(playerLocation));
    renderUserWaypoints();

    if (selectedClosestCategory) {
      const res = findClosestByCategory(selectedClosestCategory);
      closestTargetLoc = res ? res.loc : null;
      routeToClosestTarget(false);
    }

    populateFiltersGrid();

    // Expand bottom drawer to show the Find Closest list when location is placed
    const drawer = document.getElementById('bottom-drawer');
    if (drawer) {
      drawer.style.transform = 'translateY(0%)';
    }
    broadcastSquadState('my_loc');
  }

  // --- BUDDY LOCATION (2-PIN MEETUP TOOL) ---
  function getCardinalDirection(bearing) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(((bearing % 360) + 360) % 360 / 45) % 8;
    return dirs[idx];
  }

  function formatTravelTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  function clearBuddyLocations() {
    isBuddyMode = false;
    buddyPins = [];
    buddyLayer.clearLayers();
    if (buddyLine) {
      map.removeLayer(buddyLine);
      buddyLine = null;
    }
    const btn = document.getElementById('btn-buddy');
    if (btn) btn.classList.remove('active');
    const hud = document.getElementById('buddy-hud');
    if (hud) hud.style.display = 'none';
    updatePinPlacementLock();
    broadcastSquadState('buddy');
  }

  function renderBuddyLocations() {
    buddyLayer.clearLayers();
    if (buddyLine) {
      map.removeLayer(buddyLine);
      buddyLine = null;
    }

    const hud = document.getElementById('buddy-hud');
    const promptEl = document.getElementById('buddy-prompt');
    const btn = document.getElementById('btn-buddy');

    if (!isBuddyMode && buddyPins.length === 0) {
      if (hud) hud.style.display = 'none';
      if (btn) btn.classList.remove('active');
      return;
    }

    if (btn) btn.classList.add('active');

    // Calculate stats if both pins are placed
    let stats = null;
    if (buddyPins.length >= 2) {
      const p1 = buddyPins[0];
      const p2 = buddyPins[1];
      const latlng1 = toLatLng(p1.x, p1.y);
      const latlng2 = toLatLng(p2.x, p2.y);

      buddyLine = L.polyline([latlng1, latlng2], {
        color: currentLayer === 'topo' ? '#000000' : '#ffb300',
        weight: 4,
        dashArray: '8, 6'
      }).addTo(map);

      const dx1to2 = p2.x - p1.x;
      const dy1to2 = p2.y - p1.y;
      const distance = Math.round(Math.hypot(dx1to2, dy1to2));
      const distStr = distance > 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance} m`;

      let bearing1to2 = Math.round(Math.atan2(dx1to2, dy1to2) * (180 / Math.PI));
      if (bearing1to2 < 0) bearing1to2 += 360;
      const card1to2 = getCardinalDirection(bearing1to2);

      const dx2to1 = p1.x - p2.x;
      const dy2to1 = p1.y - p2.y;
      let bearing2to1 = Math.round(Math.atan2(dx2to1, dy2to1) * (180 / Math.PI));
      if (bearing2to1 < 0) bearing2to1 += 360;
      const card2to1 = getCardinalDirection(bearing2to1);

      const walkStr = formatTravelTime(Math.round(distance / 4.0));
      const runStr = formatTravelTime(Math.round(distance / 6.5));

      stats = {
        distStr,
        walkStr,
        runStr,
        dir1to2: `${card1to2} (${bearing1to2}°)`,
        dir2to1: `${card2to1} (${bearing2to1}°)`,
        p1HigherY: p1.y >= p2.y
      };
    }

    // Render placed pins with their status readout box anchored directly next to each pin
    buddyPins.forEach((pin, index) => {
      const isPin1 = index === 0;
      const latlng = toLatLng(pin.x, pin.y);
      const otherPin = buddyPins[isPin1 ? 1 : 0];
      const pinName = pin.callsign ? pin.callsign : (isPin1 ? 'PIN 1' : 'PIN 2 / BUDDY');
      const otherName = otherPin && otherPin.callsign ? otherPin.callsign : (isPin1 ? 'Buddy' : 'Pin 1');

      let boxHtml = '';
      if (stats) {
        // Place the readout box above the northernmost pin and below the southernmost pin so they never collide
        const placeAbove = isPin1 ? stats.p1HigherY : !stats.p1HigherY;
        const posClass = placeAbove ? 'above-pin' : '';
        const boxTypeClass = isPin1 ? 'pin1-box' : 'pin2-box';
        const dirClass = isPin1 ? 'dir-cyan' : 'dir-gold';
        const titleStr = `${isPin1 ? '📍' : '👥'} ${pinName} (To ${otherName})`;
        const dirVal = isPin1 ? stats.dir1to2 : stats.dir2to1;

        boxHtml = `
          <div class="buddy-readout-box ${boxTypeClass} ${posClass}">
            <div class="buddy-box-header">
              <span>${titleStr}</span>
              <span class="buddy-coords">X:${formatCoord(pin.x)} Y:${formatCoord(pin.y)}</span>
            </div>
            <div class="buddy-stats-grid">
              <div class="buddy-stat">
                <span class="label">Distance</span>
                <span class="val">${stats.distStr}</span>
              </div>
              <div class="buddy-stat">
                <span class="label">Direction</span>
                <span class="val ${dirClass}">${dirVal}</span>
              </div>
              <div class="buddy-stat">
                <span class="label">Walk Time</span>
                <span class="val">${stats.walkStr}</span>
              </div>
              <div class="buddy-stat">
                <span class="label">Run Time</span>
                <span class="val">${stats.runStr}</span>
              </div>
            </div>
          </div>
        `;
      }

      const icon = L.divIcon({
        className: 'player-loc-icon',
        html: isPin1
          ? `
            <div class="player-loc-beacon">
              <div class="player-loc-label">${pin.callsign ? pin.callsign.toUpperCase() : 'PIN 1'}</div>
              <div class="player-loc-pulse"></div>
              <div class="player-loc-dot">1</div>
              ${boxHtml}
            </div>
          `
          : `
            <div class="player-loc-beacon">
              <div class="buddy-loc-label">${pin.callsign ? pin.callsign.toUpperCase() : 'PIN 2 (BUDDY)'}</div>
              <div class="buddy-loc-pulse"></div>
              <div class="buddy-loc-dot">👥</div>
              ${boxHtml}
            </div>
          `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker(latlng, { icon: icon, draggable: true, zIndexOffset: 9000 });
      marker.on('dragend', (e) => {
        const coords = fromLatLng(e.target.getLatLng());
        buddyPins[index] = {
          x: coords.x,
          y: coords.y,
          callsign: buddyPins[index].callsign || (squadClient && squadClient.connected ? squadCallsign : null)
        };
        renderBuddyLocations();
      });

      buddyLayer.addLayer(marker);
    });

    if (buddyPins.length === 0) {
      if (hud) hud.style.display = 'flex';
      if (promptEl) {
        promptEl.style.display = 'block';
        promptEl.innerText = 'Tap map to place Pin 1 (1/2)';
      }
    } else if (buddyPins.length === 1) {
      if (hud) hud.style.display = 'flex';
      if (promptEl) {
        promptEl.style.display = 'block';
        promptEl.innerText = 'Tap map to place Buddy Pin 2 (2/2)';
      }
    } else {
      if (hud) hud.style.display = 'none';
    }
    updatePinPlacementLock();
    broadcastSquadState('buddy');
  }

  // --- WAYPOINT MEET-UP (EQUIDISTANT LANDMARK FINDER) ---
  const MEETUP_CATEGORIES = new Set(['towns', 'hunting', 'landmarks', 'military']);

  function findEquidistantMeetup(p1, p2) {
    const candidates = DAYZ_DATA.locations.filter(loc => MEETUP_CATEGORIES.has(loc.type));
    if (candidates.length === 0) return null;

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    let bestLoc = null;
    let bestScore = Infinity;

    candidates.forEach(loc => {
      const d1 = Math.hypot(loc.x - p1.x, loc.y - p1.y);
      const d2 = Math.hypot(loc.x - p2.x, loc.y - p2.y);
      const diff = Math.abs(d1 - d2);
      const distFromMid = Math.hypot(loc.x - midX, loc.y - midY);

      // Prioritize minimum distance difference (equidistant), while keeping total travel near the midpoint
      const score = diff * 2.5 + distFromMid;
      if (score < bestScore) {
        bestScore = score;
        bestLoc = loc;
      }
    });

    return bestLoc;
  }

  function clearMeetupLocations() {
    isMeetupMode = false;
    meetupPins = [];
    meetupLayer.clearLayers();
    meetupLines.forEach(l => map.removeLayer(l));
    meetupLines = [];
    const btn = document.getElementById('btn-meetup');
    if (btn) btn.classList.remove('active');
    const hud = document.getElementById('buddy-hud');
    if (hud && !isBuddyMode) hud.style.display = 'none';
    updatePinPlacementLock();
    broadcastSquadState('meetup');
  }

  function renderMeetupLocations() {
    meetupLayer.clearLayers();
    meetupLines.forEach(l => map.removeLayer(l));
    meetupLines = [];

    const hud = document.getElementById('buddy-hud');
    const promptEl = document.getElementById('buddy-prompt');
    const btn = document.getElementById('btn-meetup');

    if (!isMeetupMode && meetupPins.length === 0) {
      if (hud && !isBuddyMode) hud.style.display = 'none';
      if (btn) btn.classList.remove('active');
      return;
    }

    if (btn) btn.classList.add('active');

    let meetupSpot = null;
    let pinStats = [];

    if (meetupPins.length >= 2) {
      const p1 = meetupPins[0];
      const p2 = meetupPins[1];
      meetupSpot = findEquidistantMeetup(p1, p2);

      if (meetupSpot) {
        const targetLatLng = toLatLng(meetupSpot.x, meetupSpot.y);
        const lineColor = currentLayer === 'topo' ? '#000000' : '#7cb342';

        [p1, p2].forEach((p) => {
          const pinLatLng = toLatLng(p.x, p.y);
          const line = L.polyline([pinLatLng, targetLatLng], {
            color: lineColor,
            weight: 4,
            dashArray: '8, 6'
          }).addTo(map);
          meetupLines.push(line);

          const dx = meetupSpot.x - p.x;
          const dy = meetupSpot.y - p.y;
          const dist = Math.round(Math.hypot(dx, dy));
          const distStr = dist > 1000 ? `${(dist / 1000).toFixed(2)} km` : `${dist} m`;

          let bearing = Math.round(Math.atan2(dx, dy) * (180 / Math.PI));
          if (bearing < 0) bearing += 360;
          const card = getCardinalDirection(bearing);

          const walkStr = formatTravelTime(Math.round(dist / 4.0));
          const runStr = formatTravelTime(Math.round(dist / 6.5));

          pinStats.push({
            dist,
            distStr,
            dirStr: `${card} (${bearing}°)`,
            walkStr,
            runStr
          });
        });

        // Render the Equidistant Georgia Pine Spot Marker with only the Top Label Pill
        const cat = DAYZ_DATA.categories[meetupSpot.type] || { icon: '🌲', name: 'Georgia Pine Spot' };

        const targetIcon = L.divIcon({
          className: 'player-loc-icon',
          html: `
            <div class="player-loc-beacon">
              <div class="meetup-loc-label">🌲 GEORGIA PINE: ${meetupSpot.en.toUpperCase()}</div>
              <div class="meetup-loc-pulse"></div>
              <div class="meetup-loc-dot">${cat.icon}</div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const targetMarker = L.marker(targetLatLng, { icon: targetIcon, zIndexOffset: 9500 });
        meetupLayer.addLayer(targetMarker);
      }
    }

    // Render Pin 1 & Pin 2 with their status boxes pointing to the Meet-Up Spot
    meetupPins.forEach((pin, index) => {
      const isPin1 = index === 0;
      const latlng = toLatLng(pin.x, pin.y);
      const pinName = pin.callsign ? pin.callsign : (isPin1 ? 'PIN 1' : 'PIN 2');

      let boxHtml = '';
      if (meetupSpot && pinStats[index]) {
        const st = pinStats[index];
        const otherPin = meetupPins[isPin1 ? 1 : 0];
        const placeAbove = pin.y >= otherPin.y;
        const posClass = placeAbove ? 'above-pin' : '';
        const boxTypeClass = isPin1 ? 'pin1-box' : 'pin2-box';
        const dirClass = isPin1 ? 'dir-cyan' : 'dir-gold';
        const titleStr = `${isPin1 ? '📍' : '👥'} ${pinName} (To ${meetupSpot.en})`;

        boxHtml = `
          <div class="buddy-readout-box ${boxTypeClass} ${posClass}">
            <div class="buddy-box-header">
              <span>${titleStr}</span>
              <span class="buddy-coords">X:${formatCoord(pin.x)} Y:${formatCoord(pin.y)}</span>
            </div>
            <div class="buddy-stats-grid">
              <div class="buddy-stat">
                <span class="label">Distance</span>
                <span class="val">${st.distStr}</span>
              </div>
              <div class="buddy-stat">
                <span class="label">Direction</span>
                <span class="val ${dirClass}">${st.dirStr}</span>
              </div>
              <div class="buddy-stat">
                <span class="label">Walk Time</span>
                <span class="val">${st.walkStr}</span>
              </div>
              <div class="buddy-stat">
                <span class="label">Run Time</span>
                <span class="val">${st.runStr}</span>
              </div>
            </div>
          </div>
        `;
      }

      const icon = L.divIcon({
        className: 'player-loc-icon',
        html: isPin1
          ? `
            <div class="player-loc-beacon">
              <div class="player-loc-label">${pin.callsign ? pin.callsign.toUpperCase() : 'PIN 1'}</div>
              <div class="player-loc-pulse"></div>
              <div class="player-loc-dot">1</div>
              ${boxHtml}
            </div>
          `
          : `
            <div class="player-loc-beacon">
              <div class="buddy-loc-label">${pin.callsign ? pin.callsign.toUpperCase() : 'PIN 2'}</div>
              <div class="buddy-loc-pulse"></div>
              <div class="buddy-loc-dot">2</div>
              ${boxHtml}
            </div>
          `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker(latlng, { icon: icon, draggable: true, zIndexOffset: 9000 });
      marker.on('dragend', (e) => {
        const coords = fromLatLng(e.target.getLatLng());
        meetupPins[index] = {
          x: coords.x,
          y: coords.y,
          callsign: meetupPins[index].callsign || (squadClient && squadClient.connected ? squadCallsign : null)
        };
        renderMeetupLocations();
      });

      meetupLayer.addLayer(marker);
    });

    if (meetupPins.length === 0) {
      if (hud) hud.style.display = 'flex';
      if (promptEl) {
        promptEl.style.display = 'block';
        promptEl.innerText = '🌲 Georgia Pine: Tap map to place Pin 1 (1/2)';
      }
    } else if (meetupPins.length === 1) {
      if (hud) hud.style.display = 'flex';
      if (promptEl) {
        promptEl.style.display = 'block';
        promptEl.innerText = '🌲 Georgia Pine: Tap map to place Pin 2 (2/2)';
      }
    } else {
      if (hud) hud.style.display = 'none';
    }
    updatePinPlacementLock();
    broadcastSquadState('meetup');
  }

  // --- REAL-TIME LIVE SQUAD ROOM SYNC ---
  function updateSquadUI() {
    const isConnected = Boolean(squadClient && squadClient.connected);
    const btn = document.getElementById('btn-squad');
    const dot = document.getElementById('squad-dot');
    const pill = document.getElementById('squad-status-pill');
    const joinBtn = document.getElementById('squad-join-btn');
    const leaveBtn = document.getElementById('squad-leave-btn');
    const peersBox = document.getElementById('squad-peers-box');
    const peersList = document.getElementById('squad-peers-list');

    if (btn) btn.classList.toggle('active', isConnected);
    if (dot) dot.style.display = isConnected ? 'block' : 'none';
    if (pill) {
      pill.innerText = isConnected ? `LIVE • ${squadRoomCode}` : 'OFFLINE';
      pill.classList.toggle('online', isConnected);
    }
    if (joinBtn) joinBtn.innerText = isConnected ? '🔄 Re-Sync Room' : '📡 Connect to Squad Room';
    if (leaveBtn) leaveBtn.style.display = isConnected ? 'inline-block' : 'none';
    if (peersBox) peersBox.style.display = isConnected ? 'block' : 'none';

    if (peersList && isConnected) {
      const peerEntries = Object.values(squadPeers);
      if (peerEntries.length === 0) {
        peersList.innerHTML = `<div style="color:#90a4ae;">Connected as <b>${squadCallsign}</b>. Waiting for buddy to join room <b>${squadRoomCode}</b>...</div>`;
      } else {
        peersList.innerHTML = peerEntries.map(p => `
          <div class="squad-peer-item">
            <span>👥 ${p.callsign}</span>
            <span style="color:#7cb342;">${p.loc ? `X:${formatCoord(p.loc.x)} Y:${formatCoord(p.loc.y)}` : 'Online'}</span>
          </div>
        `).join('');
      }
    }
  }

  function broadcastSquadState(eventType = 'sync') {
    if (!squadClient || !squadClient.connected || !squadRoomCode || isApplyingSquadSync) return;
    const topic = `dayz_tactical_squad_v1/${squadRoomCode.toLowerCase()}`;
    const payload = {
      senderId: squadSenderId,
      callsign: squadCallsign,
      eventType,
      timestamp: Date.now(),
      playerLocation,
      buddyPins,
      isBuddyMode,
      meetupPins,
      isMeetupMode
    };
    try {
      squadClient.publish(topic, JSON.stringify(payload), { qos: 0, retain: false });
    } catch (e) {}
  }

  function handleSquadMessage(msg) {
    if (!msg || msg.senderId === squadSenderId) return;

    squadPeers[msg.senderId] = {
      callsign: msg.callsign || 'Squad Mate',
      loc: msg.playerLocation || null,
      updated: Date.now()
    };

    isApplyingSquadSync = true;
    try {
      // Sync shared Buddy Location pins if sent by peer
      if (msg.eventType === 'buddy' && Array.isArray(msg.buddyPins)) {
        if (msg.buddyPins.length === 0 && !msg.isBuddyMode) {
          clearBuddyLocations();
        } else {
          if (isMeetupMode || meetupPins.length > 0) clearMeetupLocations();
          isBuddyMode = Boolean(msg.isBuddyMode || msg.buddyPins.length > 0);
          buddyPins = msg.buddyPins.map(p => ({ x: p.x, y: p.y, callsign: p.callsign || msg.callsign || null }));
          renderBuddyLocations();
        }
      }

      // Sync shared Georgia Pine pins if sent by peer
      if (msg.eventType === 'meetup' && Array.isArray(msg.meetupPins)) {
        if (msg.meetupPins.length === 0 && !msg.isMeetupMode) {
          clearMeetupLocations();
        } else {
          if (isBuddyMode || buddyPins.length > 0) clearBuddyLocations();
          isMeetupMode = Boolean(msg.isMeetupMode || msg.meetupPins.length > 0);
          meetupPins = msg.meetupPins.map(p => ({ x: p.x, y: p.y, callsign: p.callsign || msg.callsign || null }));
          renderMeetupLocations();
        }
      }

      // If both players have set their own "My Location" (📍), automatically link them in Buddy Location or Georgia Pine!
      if ((msg.eventType === 'my_loc' || msg.eventType === 'hello' || msg.eventType === 'sync') && msg.playerLocation) {
        if (playerLocation) {
          if (isMeetupMode || meetupPins.length > 0) {
            meetupPins = [
              { x: playerLocation.x, y: playerLocation.y, callsign: squadCallsign },
              { x: msg.playerLocation.x, y: msg.playerLocation.y, callsign: msg.callsign || 'Squad Mate' }
            ];
            renderMeetupLocations();
          } else {
            isBuddyMode = true;
            buddyPins = [
              { x: playerLocation.x, y: playerLocation.y, callsign: squadCallsign },
              { x: msg.playerLocation.x, y: msg.playerLocation.y, callsign: msg.callsign || 'Squad Mate' }
            ];
            renderBuddyLocations();
          }
        }
      }

      // If peer just joined and said hello, reply with our state so they immediately see our pins
      if (msg.eventType === 'hello') {
        setTimeout(() => broadcastSquadState('sync'), 250);
      }
    } finally {
      isApplyingSquadSync = false;
    }

    updateSquadUI();
  }

  function connectSquadRoom(roomCode, callsign) {
    if (!window.mqtt) return;
    const cleanRoom = (roomCode || '').trim().toUpperCase();
    const cleanName = (callsign || '').trim() || squadCallsign;
    if (!cleanRoom) return;

    squadRoomCode = cleanRoom;
    squadCallsign = cleanName;
    localStorage.setItem('dayz_squad_room', squadRoomCode);
    localStorage.setItem('dayz_squad_callsign', squadCallsign);

    if (squadClient) {
      try { squadClient.end(true); } catch (e) {}
      squadClient = null;
    }
    squadPeers = {};

    const pill = document.getElementById('squad-status-pill');
    if (pill) pill.innerText = 'CONNECTING...';

    const topic = `dayz_tactical_squad_v1/${squadRoomCode.toLowerCase()}`;
    squadClient = window.mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
      clientId: 'dayz_' + squadSenderId + '_' + Math.floor(Math.random() * 10000),
      clean: true,
      connectTimeout: 5000,
      reconnectPeriod: 3000
    });

    squadClient.on('connect', () => {
      squadClient.subscribe(topic, { qos: 0 }, () => {
        updateSquadUI();
        broadcastSquadState('hello');
      });
    });

    squadClient.on('message', (t, messageBuffer) => {
      try {
        const data = JSON.parse(messageBuffer.toString());
        handleSquadMessage(data);
      } catch (e) {}
    });

    squadClient.on('close', () => {
      updateSquadUI();
    });
  }

  function disconnectSquadRoom() {
    if (squadClient) {
      try { squadClient.end(true); } catch (e) {}
      squadClient = null;
    }
    squadPeers = {};
    updateSquadUI();
  }

  // --- RULER & SNIPER RANGEFINDER ---
  function activateRuler() {
    isRulerActive = !isRulerActive;
    const btn = document.getElementById('btn-ruler');
    const hud = document.getElementById('measure-hud');
    btn.classList.toggle('active', isRulerActive);
    hud.style.display = isRulerActive ? 'flex' : 'none';

    if (!isRulerActive) {
      clearRuler();
    }
    updatePinPlacementLock();
  }

  function clearRuler() {
    if (rulerLine) {
      map.removeLayer(rulerLine);
      rulerLine = null;
    }
    rulerMarkers.forEach(m => map.removeLayer(m));
    rulerMarkers = [];
    document.getElementById('ruler-dist').innerText = '0 m';
    document.getElementById('ruler-bearing').innerText = 'N (0°)';
    document.getElementById('ruler-walk').innerText = '0s';
    document.getElementById('ruler-time').innerText = '0s';
  }

  function handleRulerClick(latlng) {
    if (rulerMarkers.length >= 2) {
      clearRuler();
    }

    const marker = L.circleMarker(latlng, {
      radius: 6,
      color: '#d32f2f',
      fillColor: '#fff',
      fillOpacity: 1
    }).addTo(map);

    rulerMarkers.push(marker);

    if (rulerMarkers.length === 2) {
      const p1 = rulerMarkers[0].getLatLng();
      const p2 = rulerMarkers[1].getLatLng();

      rulerLine = L.polyline([p1, p2], {
        color: currentLayer === 'topo' ? '#000000' : '#ff3d00',
        weight: 4,
        dashArray: '6, 6'
      }).addTo(map);

      // Calculate DayZ distance in meters
      const dx = p2.lng - p1.lng;
      const dy = p2.lat - p1.lat;
      const distance = Math.round(Math.sqrt(dx * dx + dy * dy));

      // Calculate True Compass Bearing (0° = North, 90° = East, etc.)
      let bearing = Math.round(Math.atan2(dx, dy) * (180 / Math.PI));
      if (bearing < 0) bearing += 360;
      const card = getCardinalDirection(bearing);

      // DayZ Walk/Jog (~4.0 m/s) and Run (~6.5 m/s)
      const walkStr = formatTravelTime(Math.round(distance / 4.0));
      const runStr = formatTravelTime(Math.round(distance / 6.5));

      document.getElementById('ruler-dist').innerText = distance > 1000 ? `${(distance/1000).toFixed(2)} km` : `${distance} m`;
      document.getElementById('ruler-bearing').innerText = `${card} (${bearing}°)`;
      document.getElementById('ruler-walk').innerText = walkStr;
      document.getElementById('ruler-time').innerText = runStr;
    }
  }

  // --- SETUP UI & MAP EVENTS ---
  function setupEvents() {
    const coordsValEl = document.getElementById('hud-coords-val');
    const gridValEl = document.getElementById('hud-grid-val');

    // Update Coordinates on Move
    map.on('mousemove', (e) => {
      const coords = fromLatLng(e.latlng);
      coordsValEl.innerText = `X:${formatCoord(coords.x)} Y:${formatCoord(coords.y)}`;
      gridValEl.innerText = `Grid ${formatGrid(coords.x, coords.y)}`;
    });

    // Map Click Handler
    map.on('click', (e) => {
      if (isRulerActive) {
        handleRulerClick(e.latlng);
        return;
      }

      if (isBuddyMode) {
        if (buddyPins.length < 2) {
          const coords = fromLatLng(e.latlng);
          const isSquadConnected = Boolean(squadClient && squadClient.connected);
          buddyPins.push({
            x: coords.x,
            y: coords.y,
            callsign: isSquadConnected ? squadCallsign : null
          });
          renderBuddyLocations();
        }
        return;
      }

      if (isMeetupMode) {
        if (meetupPins.length < 2) {
          const coords = fromLatLng(e.latlng);
          const isSquadConnected = Boolean(squadClient && squadClient.connected);
          meetupPins.push({
            x: coords.x,
            y: coords.y,
            callsign: isSquadConnected ? squadCallsign : null
          });
          renderMeetupLocations();
        }
        return;
      }

      if (isAddWaypointMode) {
        const coords = fromLatLng(e.latlng);
        isAddWaypointMode = false;
        updatePinPlacementLock();
        setPlayerLocation(coords.x, coords.y);
        return;
      }
    });

    // Crosshair Toggle
    const crosshairEl = document.getElementById('center-crosshair');
    document.getElementById('btn-crosshair').addEventListener('click', function() {
      this.classList.toggle('active');
      crosshairEl.classList.toggle('active');
    });

    // Center Recenter button
    document.getElementById('btn-center').addEventListener('click', () => {
      centerMapToScreenEdge();
    });

    // Ruler button
    document.getElementById('btn-ruler').addEventListener('click', activateRuler);
    document.getElementById('measure-close-btn').addEventListener('click', () => {
      if (isRulerActive) {
        activateRuler();
      } else {
        selectedClosestCategory = null;
        closestTargetLoc = null;
        clearRuler();
        document.getElementById('measure-hud').style.display = 'none';
        renderMarkers();
        populateFiltersGrid();
      }
    });

    // "This Is My Location" button: clicking when selected resets the pin
    document.getElementById('btn-add-pin').addEventListener('click', function() {
      if (playerLocation || isAddWaypointMode) {
        isAddWaypointMode = false;
        updatePinPlacementLock();
        window.dayzApp.deleteWaypoint();
      } else {
        if (isRulerActive) activateRuler();
        if (isBuddyMode || buddyPins.length > 0) clearBuddyLocations();
        if (isMeetupMode || meetupPins.length > 0) clearMeetupLocations();
        isAddWaypointMode = true;
        this.classList.add('active');
        updatePinPlacementLock();
      }
    });

    // "Buddy Location" button: pin 2 locations to calculate meetup directions
    document.getElementById('btn-buddy').addEventListener('click', function() {
      if (isBuddyMode || buddyPins.length > 0) {
        clearBuddyLocations();
      } else {
        if (isRulerActive) activateRuler();
        if (isMeetupMode || meetupPins.length > 0) clearMeetupLocations();
        isAddWaypointMode = false;
        renderUserWaypoints();
        isBuddyMode = true;
        buddyPins = [];
        renderBuddyLocations();
      }
    });

    // "Georgia Pine" button: pin 2 locations to find the closest equidistant meet-up landmark
    document.getElementById('btn-meetup').addEventListener('click', function() {
      if (isMeetupMode || meetupPins.length > 0) {
        clearMeetupLocations();
      } else {
        if (isRulerActive) activateRuler();
        if (isBuddyMode || buddyPins.length > 0) clearBuddyLocations();
        isAddWaypointMode = false;
        renderUserWaypoints();
        isMeetupMode = true;
        meetupPins = [];
        renderMeetupLocations();
      }
    });

    // "Squad Sync" button & modal events
    const squadModal = document.getElementById('squad-modal');
    const squadNameInput = document.getElementById('squad-name-input');
    const squadRoomInput = document.getElementById('squad-room-input');

    if (squadNameInput) squadNameInput.value = squadCallsign;
    if (squadRoomInput) squadRoomInput.value = squadRoomCode || 'PINE1';

    document.getElementById('btn-squad').addEventListener('click', () => {
      const isVisible = squadModal.style.display === 'block';
      squadModal.style.display = isVisible ? 'none' : 'block';
      updateSquadUI();
    });

    document.getElementById('squad-close-btn').addEventListener('click', () => {
      squadModal.style.display = 'none';
    });

    document.getElementById('squad-gen-btn').addEventListener('click', () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
      squadRoomInput.value = code;
    });

    document.getElementById('squad-join-btn').addEventListener('click', () => {
      connectSquadRoom(squadRoomInput.value, squadNameInput.value);
    });

    document.getElementById('squad-leave-btn').addEventListener('click', () => {
      disconnectSquadRoom();
    });

    // Filter Drawer Toggle
    const drawer = document.getElementById('bottom-drawer');
    const toggleDrawer = () => {
      const isExpanded = drawer.style.transform === 'translateY(0%)';
      drawer.style.transform = isExpanded ? 'translateY(calc(100% - 48px))' : 'translateY(0%)';
    };
    document.getElementById('btn-filter-drawer').addEventListener('click', toggleDrawer);
    document.querySelector('.drawer-drag-pill').addEventListener('click', toggleDrawer);
    document.querySelector('.drawer-header').addEventListener('click', (e) => {
      if (!e.target.closest('.drawer-tabs')) {
        toggleDrawer();
      }
    });

    // Search Modal
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    document.getElementById('btn-search').addEventListener('click', () => {
      searchModal.classList.toggle('active');
      if (searchModal.classList.contains('active')) {
        searchInput.focus();
        updateSearchResults('');
      }
    });

    document.getElementById('search-close').addEventListener('click', () => {
      searchModal.classList.remove('active');
    });

    searchInput.addEventListener('input', (e) => {
      updateSearchResults(e.target.value);
    });

    // Drawer Tabs (Filters vs Waypoints)
    document.querySelectorAll('.drawer-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        const target = this.dataset.tab;
        document.getElementById('tab-filters').style.display = target === 'filters' ? 'grid' : 'none';
        document.getElementById('tab-waypoints').style.display = target === 'waypoints' ? 'flex' : 'none';
      });
    });
  }

  // --- FILTERS / FIND CLOSEST GRID ---
  function populateFiltersGrid() {
    const grid = document.getElementById('tab-filters');
    grid.innerHTML = '';

    const drawerTitle = document.querySelector('.drawer-header h3');
    const firstTabBtn = document.querySelector('.drawer-tab[data-tab="filters"]');

    if (playerLocation) {
      // "FIND CLOSEST" MODE when My Location is set
      if (drawerTitle) drawerTitle.innerHTML = '<span>🎯</span> Find Closest';
      if (firstTabBtn) firstTabBtn.innerText = 'Find Closest';

      Object.entries(DAYZ_DATA.categories).forEach(([key, cat]) => {
        const closest = findClosestByCategory(key);
        let distLabel = 'N/A';
        if (closest) {
          const dStr = closest.distance > 1000 ? `${(closest.distance / 1000).toFixed(1)} km` : `${closest.distance} m`;
          const dx = closest.loc.x - playerLocation.x;
          const dy = closest.loc.y - playerLocation.y;
          let bearing = Math.round(Math.atan2(dx, dy) * (180 / Math.PI));
          if (bearing < 0) bearing += 360;
          const card = getCardinalDirection(bearing);
          distLabel = `${dStr} ${card} (${bearing}°)`;
        }
        const isSelected = selectedClosestCategory === key;

        const chip = document.createElement('div');
        chip.className = `filter-chip ${isSelected ? 'active' : ''}`;
        chip.innerHTML = `
          <div class="chip-left">
            <span class="chip-check-icon">${isSelected ? '🎯' : '○'}</span>
            <span>${cat.icon}</span>
            <span>${cat.name}</span>
          </div>
          <span class="chip-count" style="color:${isSelected ? '#26c6da' : '#fff'};">${distLabel}</span>
        `;
        chip.addEventListener('click', () => {
          if (selectedClosestCategory === key) {
            selectedClosestCategory = null;
            closestTargetLoc = null;
            routeToClosestTarget(false);
          } else {
            selectedClosestCategory = key;
            const match = findClosestByCategory(key);
            closestTargetLoc = match ? match.loc : null;
            routeToClosestTarget(true);
          }
          populateFiltersGrid();
        });
        grid.appendChild(chip);
      });
    } else {
      // STANDARD "FILTERS" MODE when My Location is not set
      if (drawerTitle) drawerTitle.innerHTML = '<span>⚡</span> Tactical Layers';
      if (firstTabBtn) firstTabBtn.innerText = 'Filters';

      Object.entries(DAYZ_DATA.categories).forEach(([key, cat]) => {
        const count = DAYZ_DATA.locations.filter(l => l.type === key).length;
        const isChecked = activeCategories.has(key);
        const chip = document.createElement('div');
        chip.className = `filter-chip ${isChecked ? 'active' : ''}`;
        chip.innerHTML = `
          <div class="chip-left">
            <span class="chip-check-icon">${isChecked ? '☑' : '☐'}</span>
            <span>${cat.icon}</span>
            <span>${cat.name}</span>
          </div>
          <span class="chip-count">${count}</span>
        `;
        chip.addEventListener('click', () => {
          if (activeCategories.has(key)) {
            activeCategories.delete(key);
            chip.classList.remove('active');
            chip.querySelector('.chip-check-icon').innerText = '☐';
          } else {
            activeCategories.add(key);
            chip.classList.add('active');
            chip.querySelector('.chip-check-icon').innerText = '☑';
          }
          renderMarkers();
        });
        grid.appendChild(chip);
      });
    }
  }

  // --- SEARCH SYSTEM ---
  function updateSearchResults(query) {
    const list = document.getElementById('search-results');
    list.innerHTML = '';
    const q = query.toLowerCase().trim();

    const refCoords = playerLocation ? playerLocation : fromLatLng(map.getCenter());

    const filtered = DAYZ_DATA.locations.filter(loc => {
      if (!q) return true;
      return loc.en.toLowerCase().includes(q) || loc.name.toLowerCase().includes(q) || loc.desc.toLowerCase().includes(q);
    }).slice(0, 20);

    filtered.forEach(loc => {
      const cat = DAYZ_DATA.categories[loc.type] || { icon: "📍" };
      const dx = loc.x - refCoords.x;
      const dy = loc.y - refCoords.y;
      const dist = Math.round(Math.hypot(dx, dy));
      let bearing = Math.round(Math.atan2(dx, dy) * (180 / Math.PI));
      if (bearing < 0) bearing += 360;
      const card = getCardinalDirection(bearing);
      const distStr = dist > 1000 ? `${(dist/1000).toFixed(1)} km` : `${dist} m`;

      const item = document.createElement('div');
      item.className = 'search-item';
      const walkStr = formatTravelTime(Math.round(dist / 4.0));
      const runStr = formatTravelTime(Math.round(dist / 6.5));
      item.innerHTML = `
        <div class="search-item-info">
          <h4>${cat.icon} ${loc.en}</h4>
          <p>${loc.name} • Grid ${formatGrid(loc.x, loc.y)}</p>
        </div>
        <div class="search-item-dist" style="text-align:right;">
          <div>${distStr} • ${card} (${bearing}°)</div>
          <div style="font-size:10px; color:#90a4ae;">Walk: ${walkStr} | Run: ${runStr}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        document.getElementById('search-modal').classList.remove('active');
        window.dayzApp.flyToCoords(loc.x, loc.y);
      });
      list.appendChild(item);
    });
  }

  // --- GLOBAL EXPOSED APP API ---
  window.dayzApp = {
    flyToCoords: function(x, y) {
      map.flyTo(toLatLng(x, y), 5.5, { duration: 1.2 });
    },
    startRulerFrom: function(x, y, label) {
      map.closePopup();
      if (!isRulerActive) activateRuler();
      clearRuler();
      handleRulerClick(toLatLng(x, y));
    },
    deleteWaypoint: function() {
      playerLocation = null;
      selectedClosestCategory = null;
      closestTargetLoc = null;
      localStorage.removeItem('dayz_player_location');
      routeToClosestTarget(false);
      renderUserWaypoints();
      populateFiltersGrid();
      broadcastSquadState('my_loc');
    }
  };

  // Live Offline Download Progress Monitor
  function pollDownloadStatus() {
    fetch('./download_status.json?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        const pctEl = document.getElementById('tracker-pct');
        const barEl = document.getElementById('tracker-bar-fill');
        const subEl = document.getElementById('tracker-sub');
        if (!pctEl || !barEl || !subEl) return;

        const pct = data.overallPercent || 0;
        pctEl.innerText = `${pct}%`;
        barEl.style.width = `${pct}%`;

        if (data.active) {
          subEl.innerHTML = `<span>Zoom ${data.currentZoom} (${data.zoomProgress})</span><span>${data.totalOnDisk.toLocaleString()} / ${data.totalExpected.toLocaleString()} tiles</span>`;
        } else {
          pctEl.innerText = '100%';
          barEl.style.width = '100%';
          subEl.innerHTML = `<span>✓ Complete</span><span>${data.totalOnDisk.toLocaleString()} tiles saved</span>`;
        }
      })
      .catch(() => {});
  }

  // Run on DOM loaded
  document.addEventListener('DOMContentLoaded', () => {
    initMap();
    pollDownloadStatus();
    setInterval(pollDownloadStatus, 3000);
  });
})();
