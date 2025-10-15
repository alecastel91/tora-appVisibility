// Enhanced users data with global venues
var users = [
    // Artists
    { id: 1, name: 'Simone De Kunovich', type: 'artist', location: 'Milan', country: 'Italy', genres: ['House', 'Disco'], bio: 'Italian selector bringing cosmic disco vibes', isConnected: false, isLiked: false, requestStatus: null, ra: 'https://ra.co/dj/simonedekunovich' },
    { id: 2, name: 'Tornado Wallace', type: 'artist', location: 'Berlin', country: 'Germany', genres: ['House', 'Disco'], bio: 'ESP Institute artist, modern disco pioneer', isConnected: false, isLiked: false, requestStatus: null, ra: 'https://ra.co/dj/tornadowallace' },
    { id: 3, name: 'Fantastic Man', type: 'artist', location: 'Amsterdam', country: 'Netherlands', genres: ['House', 'Techno'], bio: 'Eclectic selector and producer', isConnected: false, isLiked: false, requestStatus: null },
    { id: 4, name: 'Gonno', type: 'artist', location: 'Tokyo', country: 'Japan', genres: ['House', 'Techno'], bio: 'Tokyo underground scene leader', isConnected: false, isLiked: false, requestStatus: null },
    { id: 5, name: 'Kenji Takimi', type: 'artist', location: 'Osaka', country: 'Japan', genres: ['Techno', 'Deep House'], bio: 'Osaka techno pioneer', isConnected: false, isLiked: false, requestStatus: null },
    
    // Venues - Asia
    { id: 19, name: 'Womb', type: 'venue', location: 'Tokyo', country: 'Japan', genres: ['Techno', 'House'], bio: 'Iconic Shibuya superclub with 4 floors', color: '#ff00ff', isConnected: true, isLiked: true, requestStatus: null },
    { id: 20, name: 'VENT', type: 'venue', location: 'Tokyo', country: 'Japan', genres: ['Techno', 'House'], bio: 'Underground Omotesando venue', color: '#000', isConnected: true, isLiked: true, requestStatus: null },
    { id: 21, name: 'ENTER', type: 'venue', location: 'Tokyo', country: 'Japan', genres: ['House', 'Disco'], bio: 'Intimate Shibuya spot', color: '#ff3366', isConnected: false, isLiked: false, requestStatus: null },
    { id: 22, name: 'Mitsuki', type: 'venue', location: 'Tokyo', country: 'Japan', genres: ['House', 'Techno'], bio: 'Tokyo underground venue', color: '#667eea', isConnected: false, isLiked: false, requestStatus: null },
    { id: 23, name: 'Cakeshop', type: 'venue', location: 'Seoul', country: 'South Korea', genres: ['Techno', 'House'], bio: 'Itaewon institution', color: '#ff9900', isConnected: false, isLiked: false, requestStatus: null },
    { id: 24, name: 'Beam Cube', type: 'venue', location: 'Bangkok', country: 'Thailand', genres: ['Techno', 'House'], bio: 'Bangkok electronic venue', color: '#00ff00', isConnected: false, isLiked: false, requestStatus: null },
    { id: 25, name: 'Beam Club', type: 'venue', location: 'Bangkok', country: 'Thailand', genres: ['House', 'Disco'], bio: 'Bangkok house music venue', color: '#00aa00', isConnected: false, isLiked: false, requestStatus: null },
    { id: 26, name: 'Zodiac', type: 'venue', location: 'Jakarta', country: 'Indonesia', genres: ['House', 'Techno'], bio: 'Jakarta electronic club', color: '#9900ff', isConnected: false, isLiked: false, requestStatus: null },
    { id: 27, name: 'Mihn', type: 'venue', location: 'Hong Kong', country: 'Hong Kong', genres: ['House', 'Disco'], bio: 'Hong Kong underground spot', color: '#ff6600', isConnected: false, isLiked: false, requestStatus: null },
    
    // Venues - Europe
    { id: 28, name: 'Berghain', type: 'venue', location: 'Berlin', country: 'Germany', genres: ['Techno'], bio: 'Legendary techno temple', color: '#000', isConnected: false, isLiked: false, requestStatus: null },
    { id: 29, name: 'Fabric', type: 'venue', location: 'London', country: 'United Kingdom', genres: ['Techno', 'House'], bio: 'Iconic Farringdon club', color: '#0066cc', isConnected: false, isLiked: false, requestStatus: null },
    { id: 30, name: 'Printworks', type: 'venue', location: 'London', country: 'United Kingdom', genres: ['Techno', 'House'], bio: 'Massive warehouse venue', color: '#ff6600', isConnected: false, isLiked: false, requestStatus: null },
    { id: 31, name: 'Rex Club', type: 'venue', location: 'Paris', country: 'France', genres: ['Techno'], bio: 'Parisian techno institution', color: '#ff0000', isConnected: false, isLiked: false, requestStatus: null },
    { id: 32, name: 'De School', type: 'venue', location: 'Amsterdam', country: 'Netherlands', genres: ['House', 'Techno'], bio: '24-hour Amsterdam club', color: '#00aa00', isConnected: false, isLiked: false, requestStatus: null },
    
    // Venues - Americas
    { id: 33, name: 'Output', type: 'venue', location: 'New York', country: 'United States', genres: ['Techno', 'House'], bio: 'Brooklyn warehouse club', color: '#0099ff', isConnected: false, isLiked: false, requestStatus: null },
    { id: 34, name: 'Space Miami', type: 'venue', location: 'Miami', country: 'United States', genres: ['House', 'Techno'], bio: 'Downtown Miami superclub', color: '#ff00ff', isConnected: false, isLiked: false, requestStatus: null },
    { id: 35, name: 'Smart Bar', type: 'venue', location: 'Chicago', country: 'United States', genres: ['House', 'Techno'], bio: 'Underground Chicago venue', color: '#666666', isConnected: false, isLiked: false, requestStatus: null }
];

// Global variables
var currentMatchIndex = 0;
var currentLang = 'en';
var mapScale = 1;
var currentZoomLevel = 0;
var currentMonth = new Date().getMonth();
var currentYear = new Date().getFullYear();
var availableDates = [];
var profileData = {};
var settingsData = {
    email: 'user@example.com',
    showCalendar: true,
    allowMessages: false,
    profileVisibility: true,
    translationLanguage: 'en'
};

// Map dragging variables
var isDragging = false;
var dragStartX = 0;
var dragStartY = 0;
var mapTranslateX = 0;
var mapTranslateY = 0;
var animationFrame = null;

// Calendar selection variables
var isSelectingDates = false;
var dateSelectionStart = null;

// Language translations
var translations = {
    en: {
        liked_profile: 'liked your profile',
        wants_connect: 'wants to connect',
        your_name: 'Your Name',
        artist: 'Artist',
        venue: 'Venue',
        promoter: 'Promoter',
        agent: 'Agent',
        liked: 'Liked',
        likes: 'Likes',
        connections: 'Connections',
        artist_name: 'Artist Name',
        role: 'Role',
        city: 'City',
        country: 'Country',
        genres: 'Genres',
        bio: 'Bio',
        website: 'Website',
        save_profile: 'Save Profile',
        conversations: 'Conversations',
        interested_booking: 'Interested in booking you...',
        translate: 'Translate',
        show_original: 'Show Original',
        send: 'Send',
        settings: 'Settings',
        account_settings: 'Account Settings',
        privacy_settings: 'Privacy Settings',
        email: 'Email',
        password: 'Password',
        change_password: 'Change Password',
        profile_visibility: 'Profile Visibility',
        save_settings: 'Save Settings',
        see_profile: 'See Profile',
        calendar: 'Calendar',
        profile: 'Profile',
        search: 'Search',
        explore: 'Explore',
        messages: 'Messages',
        connect: 'Connect',
        requested: 'Requested',
        message: 'Message',
        like: 'Like',
        see_more: 'See more',
        recent_events: 'Recent Events',
        mixtape: 'Mixtape',
        spotify: 'Spotify',
        instagram: 'Instagram',
        all_profiles: 'All Profiles',
        artists: 'Artists',
        venues: 'Venues',
        promoters: 'Promoters',
        all_countries: 'All Countries',
        all_cities: 'All Cities',
        all_genres: 'All Genres'
    },
    ja: {
        liked_profile: 'あなたのプロフィールをいいねしました',
        wants_connect: '接続したい',
        your_name: 'あなたの名前',
        artist: 'アーティスト',
        venue: '会場',
        promoter: 'プロモーター',
        agent: 'エージェント',
        liked: 'いいねした',
        likes: 'いいね',
        connections: 'つながり',
        artist_name: 'アーティスト名',
        role: '役割',
        city: '都市',
        country: '国',
        genres: 'ジャンル',
        bio: '自己紹介',
        website: 'ウェブサイト',
        save_profile: 'プロフィールを保存',
        conversations: '会話',
        interested_booking: 'あなたを予約することに興味があります...',
        translate: '翻訳',
        show_original: '元を表示',
        send: '送信',
        settings: '設定',
        account_settings: 'アカウント設定',
        privacy_settings: 'プライバシー設定',
        email: 'メール',
        password: 'パスワード',
        change_password: 'パスワードを変更',
        profile_visibility: 'プロフィールの表示',
        save_settings: '設定を保存'
    },
    es: {
        translate: 'Traducir',
        show_original: 'Mostrar Original',
        send: 'Enviar'
    },
    fr: {
        translate: 'Traduire',
        show_original: 'Afficher Original',
        send: 'Envoyer'
    },
    de: {
        translate: 'Übersetzen',
        show_original: 'Original Anzeigen',
        send: 'Senden'
    }
};

// Message translations
var messageTranslations = {
    'Hi, I\'m interested in booking you for our event!': {
        ja: 'こんにちは、私たちのイベントであなたを予約することに興味があります！',
        es: '¡Hola, estoy interesado en contratarte para nuestro evento!',
        fr: 'Bonjour, je suis intéressé pour vous réserver pour notre événement!',
        de: 'Hallo, ich bin daran interessiert, Sie für unsere Veranstaltung zu buchen!'
    },
    'October 16th in Tokyo. We can offer 1000€ plus accommodation.': {
        ja: '10月16日東京。1000€と宿泊施設を提供できます。',
        es: '16 de octubre en Tokio. Podemos ofrecer 1000€ más alojamiento.',
        fr: '16 octobre à Tokyo. Nous pouvons offrir 1000€ plus hébergement.',
        de: '16. Oktober in Tokio. Wir können 1000€ plus Unterkunft anbieten.'
    }
};

// Initialize
window.onload = function() {
    loadMatchCard();
    updateGenreCheckboxes();
    generateCalendar();
    setupMapDragging();
    setupCalendarSelection();
    populateFilters();
    
    // Load SVG
    fetch('world-map.svg')
        .then(response => response.text())
        .then(svg => {
            var mapContainer = document.getElementById('worldMap');
            if (mapContainer && svg) {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = svg;
                var svgElement = tempDiv.querySelector('svg');
                if (svgElement) {
                    svgElement.style.position = 'absolute';
                    svgElement.style.width = '100%';
                    svgElement.style.height = '100%';
                    svgElement.style.pointerEvents = 'none';
                    mapContainer.insertBefore(svgElement, mapContainer.firstChild);
                }
            }
        })
        .catch(err => console.log('SVG loading error'));
};

// Populate filters with actual data
function populateFilters() {
    // Get unique countries and cities
    var countries = [...new Set(users.map(u => u.country))].sort();
    var cities = [...new Set(users.map(u => u.location))].sort();
    
    // Update country filter
    var countryFilter = document.getElementById('countryFilter');
    if (countryFilter) {
        countryFilter.innerHTML = '<option value="">All Countries</option>';
        countries.forEach(function(country) {
            countryFilter.innerHTML += '<option value="' + country + '">' + country + '</option>';
        });
    }
    
    // Update city filter
    var cityFilter = document.getElementById('cityFilter');
    if (cityFilter) {
        cityFilter.innerHTML = '<option value="">All Cities</option>';
        cities.forEach(function(city) {
            cityFilter.innerHTML += '<option value="' + city + '">' + city + '</option>';
        });
    }
    
    // Update genre filter with all genres
    var genreFilter = document.getElementById('genreFilter');
    if (genreFilter) {
        genreFilter.innerHTML = '<option value="">All Genres</option>';
        var allGenres = ['House', 'Deep House', 'Tech House', 'Techno', 'Minimal Techno', 
                        'Acid Techno', 'Progressive House', 'Trance', 'Drum & Bass', 
                        'Dubstep', 'Ambient', 'Electronica', 'Disco', 'Afro House', 'Melodic Techno'];
        allGenres.forEach(function(genre) {
            genreFilter.innerHTML += '<option value="' + genre + '">' + genre + '</option>';
        });
    }
}

// Tab switching
function showTab(tabName, button) {
    var contents = document.querySelectorAll('.tab-content');
    contents.forEach(function(content) {
        content.classList.remove('active');
    });
    
    var tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(function(tab) {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    button.classList.add('active');
}

// Language change
function changeLanguage(lang) {
    currentLang = lang;
    document.body.className = lang;
    
    // Update all text elements with translations
    document.querySelectorAll('[data-lang]').forEach(function(elem) {
        var key = elem.getAttribute('data-lang');
        if (translations[lang] && translations[lang][key]) {
            elem.textContent = translations[lang][key];
        }
    });
}

// Save Profile
function saveProfile() {
    profileData.name = document.getElementById('artistNameInput').value || 'Your Name';
    profileData.role = document.getElementById('roleSelect').value;
    profileData.city = document.getElementById('citySelect').value;
    profileData.country = document.getElementById('countrySelect').value;
    profileData.bio = document.getElementById('bioInput').value;
    profileData.ra = document.getElementById('raInput').value;
    profileData.mix = document.getElementById('mixInput').value;
    profileData.spotify = document.getElementById('spotifyInput').value;
    profileData.instagram = document.getElementById('instagramInput').value;
    profileData.website = document.getElementById('websiteInput').value;
    
    var selectedGenres = [];
    document.querySelectorAll('.genre-option input[type="checkbox"]:checked').forEach(function(checkbox) {
        selectedGenres.push(checkbox.value);
    });
    profileData.genres = selectedGenres;
    
    document.getElementById('profileName').textContent = profileData.name;
    document.getElementById('profileLocation').textContent = profileData.city + ', ' + profileData.country;
    
    var avatarInitial = document.getElementById('avatarInitial');
    if (avatarInitial) {
        avatarInitial.textContent = profileData.name.charAt(0).toUpperCase();
    }
    
    var badge = document.getElementById('profileBadge');
    badge.className = 'user-badge badge-' + profileData.role;
    badge.textContent = profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1);
    
    alert('Profile saved successfully!');
}

// View profile as others
function viewProfileAsOthers() {
    showFullProfile({
        name: profileData.name || 'Your Name',
        type: profileData.role || 'artist',
        location: profileData.city || 'Tokyo',
        country: profileData.country || 'Japan',
        genres: profileData.genres || ['House', 'Techno'],
        bio: profileData.bio || 'Your bio here...',
        ra: profileData.ra,
        mix: profileData.mix,
        spotify: profileData.spotify,
        instagram: profileData.instagram,
        website: profileData.website,
        isConnected: false,
        isLiked: false
    }, true);
}

// Show full profile
function showFullProfile(user, isOwnProfile) {
    var fullProfile = document.getElementById('fullProfile');
    var content = document.getElementById('fullProfileContent');
    
    if (!fullProfile || !content) return;
    
    var badgeClass = 'badge-' + user.type;
    var avatarStyle = user.color ? 'background: ' + user.color : 'background: #667eea';
    
    var showCalendarMatch = false;
    if (!isOwnProfile && profileData.role && 
        ((profileData.role === 'artist' && (user.type === 'venue' || user.type === 'promoter')) ||
        ((profileData.role === 'venue' || profileData.role === 'promoter') && user.type === 'artist'))) {
        showCalendarMatch = Math.random() > 0.7;
    }
    
    var html = '<div style="text-align: center; padding: 40px 0;">';
    
    if (showCalendarMatch) {
        html += '<div class="calendar-match-flag" style="position: static; margin: 0 auto 20px; display: inline-block;">📅 Calendar Match</div><br>';
    }
    
    html += '<div style="width: 150px; height: 150px; border-radius: 50%; ' + avatarStyle + '; display: flex; align-items: center; justify-content: center; font-size: 60px; margin: 0 auto 20px;">' + 
            user.name.charAt(0) + '</div>' +
            '<h1>' + user.name + '</h1>' +
            '<div class="user-badge ' + badgeClass + '">' + user.type.toUpperCase() + '</div>' +
            '<p style="color: #888; margin: 15px 0;">📍 ' + user.location + ', ' + user.country + '</p>' +
            '<p style="margin: 30px 0; color: #aaa; line-height: 1.6; max-width: 600px; margin-left: auto; margin-right: auto;">' + (user.bio || '') + '</p>' +
            '<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin: 30px 0;">';
    
    if (user.genres && user.genres.length > 0) {
        user.genres.forEach(function(g) {
            html += '<span style="background: #333; padding: 8px 15px; border-radius: 20px; font-size: 14px;">' + g + '</span>';
        });
    }
    
    html += '</div>';
    
    // Recent Events embedded window
    var raLink = user.ra || profileData.ra;
    if (raLink) {
        html += '<div class="media-preview">' +
                '<h4>Recent Events</h4>' +
                '<iframe width="100%" height="400" src="' + raLink + '/past-events" frameborder="0" style="border-radius: 8px; background: #222;"></iframe>' +
                '</div>';
    }
    
    // Mixtape embedded window
    var mixLink = user.mix || profileData.mix;
    if (mixLink) {
        html += '<div class="media-preview">' +
                '<h4>Latest Mixtape</h4>' +
                '<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" ' +
                'src="https://w.soundcloud.com/player/?url=' + encodeURIComponent(mixLink) + 
                '&color=%23ff3366&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"></iframe>' +
                '</div>';
    }
    
    // Spotify embedded window
    var spotifyLink = user.spotify || profileData.spotify;
    if (spotifyLink) {
        // Extract Spotify artist ID from URL if needed
        var spotifyId = spotifyLink.includes('spotify.com/artist/') ? 
                       spotifyLink.split('artist/')[1].split('?')[0] : spotifyLink;
        
        html += '<div class="media-preview">' +
                '<h4>Spotify</h4>' +
                '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/artist/' + spotifyId + 
                '?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" ' +
                'allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>' +
                '</div>';
    }
    
    // Social Media buttons
    html += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 30px auto; max-width: 400px;">';
    
    var instagramLink = user.instagram || profileData.instagram;
    var websiteLink = user.website || profileData.website;
    
    if (instagramLink) {
        html += '<button class="btn btn-secondary" onclick="window.open(\'https://instagram.com/' + instagramLink.replace('@','') + '\')">Instagram</button>';
    } else {
        html += '<button class="btn btn-disabled" disabled>Instagram</button>';
    }
    
    if (websiteLink) {
        html += '<button class="btn btn-secondary" onclick="window.open(\'' + websiteLink + '\')">Website</button>';
    } else {
        html += '<button class="btn btn-disabled" disabled>Website</button>';
    }
    
    html += '</div>';
    
    // Action buttons for other users' profiles
    if (!isOwnProfile) {
        html += '<div style="display: flex; gap: 10px; max-width: 400px; margin: 30px auto;">';
        
        var likeButtonClass = user.isLiked ? 'btn-liked' : 'btn btn-secondary';
        var likeButtonText = user.isLiked ? 'Liked' : '❤ Like';
        
        html += '<button class="' + likeButtonClass + '" style="flex: 1;" onclick="likeUser(' + (user.id || 0) + ')">' + likeButtonText + '</button>';
        
        if (user.requestStatus === 'requested') {
            html += '<button class="btn btn-requested" style="flex: 1;" disabled>Requested</button>';
        } else if (user.isConnected) {
            html += '<button class="btn btn-connected" style="flex: 1;" onclick="openDirectMessage(\'' + user.name + '\', \'' + user.type + '\')">Message</button>';
        } else {
            html += '<button class="btn btn-primary" style="flex: 1;" onclick="connectUser(' + (user.id || 0) + ')">Connect</button>';
        }
        
        html += '</div>';
    }
    
    html += '</div>';
    
    content.innerHTML = html;
    fullProfile.classList.add('active');
}

function closeFullProfile() {
    document.getElementById('fullProfile').classList.remove('active');
}

// Stats details
function showStatDetails(type) {
    var modal = document.getElementById('statsModal');
    var title = document.getElementById('statsTitle');
    var content = document.getElementById('statsContent');
    
    if (!modal || !title || !content) return;
    
    title.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    
    content.innerHTML = '';
    users.slice(0, 5).forEach(function(user) {
        content.innerHTML += 
            '<div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #222; border-radius: 8px; margin-bottom: 10px; cursor: pointer;" onclick="showFullProfile(users[' + (user.id - 1) + ']); closeStatsModal();">' +
            '<div style="width: 50px; height: 50px; border-radius: 50%; background: ' + (user.color || '#667eea') + '; display: flex; align-items: center; justify-content: center; font-size: 20px;">' + 
            user.name.charAt(0) + '</div>' +
            '<div>' +
            '<strong>' + user.name + '</strong>' +
            '<span class="user-type-indicator">' + user.type + '</span>' +
            '<p style="color: #888; font-size: 14px; margin-top: 5px;">' + user.location + '</p>' +
            '</div>' +
            '</div>';
    });
    
    modal.classList.add('active');
}

function closeStatsModal() {
    document.getElementById('statsModal').classList.remove('active');
}

// Settings
function saveSettings() {
    settingsData.email = document.getElementById('settingsEmail').value;
    settingsData.showCalendar = document.getElementById('showCalendarToggle').classList.contains('active');
    settingsData.allowMessages = document.getElementById('allowMessagesToggle').classList.contains('active');
    settingsData.profileVisibility = document.getElementById('profileVisibilityToggle').classList.contains('active');
    settingsData.translationLanguage = document.getElementById('translationLanguage').value;
    
    closeSettings();
}

function openSettings() {
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

// Notifications
function toggleNotifications() {
    var panel = document.getElementById('notificationsPanel');
    var dot = document.querySelector('.notification-dot');
    
    panel.classList.toggle('active');
    
    // Hide notification dot when opened
    if (panel.classList.contains('active') && dot) {
        dot.style.display = 'none';
    }
}

// Genre selector
function toggleGenreList(event) {
    event.stopPropagation();
    var selector = document.getElementById('genreSelector');
    var list = document.getElementById('genreList');
    selector.classList.toggle('active');
    list.classList.toggle('active');
}

function updateGenreCheckboxes() {
    var checkboxes = document.querySelectorAll('.genre-option input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', updateSelectedGenres);
    });
}

function updateSelectedGenres() {
    var selected = [];
    document.querySelectorAll('.genre-option input[type="checkbox"]:checked').forEach(function(checkbox) {
        selected.push(checkbox.value);
    });
    document.getElementById('selectedGenres').textContent = 
        selected.length > 0 ? selected.join(', ') : 'Click to select genres...';
}

// Map functions with smooth dragging
function setupMapDragging() {
    var mapContainer = document.getElementById('mapContainer');
    var worldMap = document.getElementById('worldMap');
    
    if (!mapContainer || !worldMap) return;
    
    mapContainer.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('continent-marker')) return;
        
        isDragging = true;
        dragStartX = e.clientX - mapTranslateX;
        dragStartY = e.clientY - mapTranslateY;
        mapContainer.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        // Use requestAnimationFrame for smooth dragging
        if (animationFrame) cancelAnimationFrame(animationFrame);
        
        animationFrame = requestAnimationFrame(function() {
            mapTranslateX = e.clientX - dragStartX;
            mapTranslateY = e.clientY - dragStartY;
            
            var worldMap = document.getElementById('worldMap');
            if (worldMap) {
                worldMap.style.transform = 'scale(' + mapScale + ') translate(' + mapTranslateX + 'px, ' + mapTranslateY + 'px)';
            }
        });
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        var mapContainer = document.getElementById('mapContainer');
        if (mapContainer) mapContainer.style.cursor = 'grab';
    });
}

// Zoom functions
function zoomIn() {
    if (currentZoomLevel < 3) {
        currentZoomLevel++;
        updateMapZoom();
    }
}

function zoomOut() {
    if (currentZoomLevel > 0) {
        currentZoomLevel--;
        updateMapZoom();
    }
}

function updateMapZoom() {
    var scales = [1, 2, 4, 8];
    mapScale = scales[currentZoomLevel];
    
    var worldMap = document.getElementById('worldMap');
    if (worldMap) {
        worldMap.style.transition = 'transform 0.3s ease';
        worldMap.style.transform = 'scale(' + mapScale + ') translate(' + mapTranslateX + 'px, ' + mapTranslateY + 'px)';
    }
}

function zoomToContinent(continent) {
    currentZoomLevel = 1;
    mapScale = 2;
    
    // Center map on the clicked continent
    var offsets = {
        'asia': { x: -100, y: -50 },
        'europe': { x: -20, y: 0 },
        'northamerica': { x: 40, y: 0 },
        'southamerica': { x: 30, y: -40 },
        'africa': { x: -20, y: -30 },
        'oceania': { x: -120, y: -80 }
    };
    
    if (offsets[continent]) {
        mapTranslateX = offsets[continent].x;
        mapTranslateY = offsets[continent].y;
    }
    
    var worldMap = document.getElementById('worldMap');
    if (worldMap) {
        worldMap.style.transition = 'transform 0.5s ease';
        worldMap.style.transform = 'scale(' + mapScale + ') translate(' + mapTranslateX + 'px, ' + mapTranslateY + 'px)';
    }
    
    // Show users for this continent
    var continentUsers = users.filter(function(u) {
        if (continent === 'asia') {
            return ['Japan', 'South Korea', 'Thailand', 'Indonesia', 'Hong Kong'].includes(u.country);
        } else if (continent === 'europe') {
            return ['Germany', 'United Kingdom', 'France', 'Netherlands', 'Italy'].includes(u.country);
        } else if (continent === 'northamerica') {
            return ['United States', 'Canada'].includes(u.country);
        }
        return false;
    });
    
    displaySearchUsers(continentUsers);
}

function resetMap() {
    currentZoomLevel = 0;
    mapScale = 1;
    mapTranslateX = 0;
    mapTranslateY = 0;
    
    var worldMap = document.getElementById('worldMap');
    if (worldMap) {
        worldMap.style.transition = 'transform 0.3s ease';
        worldMap.style.transform = 'scale(1) translate(0, 0)';
    }
    
    document.getElementById('searchUserGrid').innerHTML = '';
    document.getElementById('cityTitle').textContent = '';
}

// Filter search results
function filterSearchResults() {
    var profileType = document.getElementById('profileTypeFilter').value;
    var country = document.getElementById('countryFilter').value;
    var city = document.getElementById('cityFilter').value;
    var genre = document.getElementById('genreFilter').value;
    
    var filtered = users.filter(function(user) {
        var matchType = !profileType || user.type === profileType;
        var matchCountry = !country || user.country === country;
        var matchCity = !city || user.location === city;
        var matchGenre = !genre || (user.genres && user.genres.includes(genre));
        
        return matchType && matchCountry && matchCity && matchGenre;
    });
    
    displaySearchUsers(filtered);
}

// Display users in search
function displaySearchUsers(userList) {
    var grid = document.getElementById('searchUserGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (userList.length === 0) {
        grid.innerHTML = '<p style="color: #888; text-align: center;">No users found matching your criteria</p>';
        return;
    }
    
    userList.forEach(function(user) {
        var card = createUserCard(user);
        grid.appendChild(card);
    });
}

// Create user card
function createUserCard(user) {
    var card = document.createElement('div');
    card.className = 'user-card';
    card.onclick = function() { showFullProfile(user); };
    
    var badgeClass = 'badge-' + user.type;
    var avatarStyle = user.color ? 'background: ' + user.color : 'background: #667eea';
    
    var showCalendarMatch = false;
    if (profileData.role && ((profileData.role === 'artist' && (user.type === 'venue' || user.type === 'promoter')) ||
        ((profileData.role === 'venue' || profileData.role === 'promoter') && user.type === 'artist'))) {
        showCalendarMatch = Math.random() > 0.7;
    }
    
    var html = (showCalendarMatch ? '<div class="calendar-match-flag">📅 Calendar Match</div>' : '') +
        '<div class="user-badge ' + badgeClass + '">' + user.type.toUpperCase() + '</div>' +
        '<div class="user-card-header">' +
        '<div class="user-card-avatar" style="' + avatarStyle + '">' + user.name.charAt(0) + '</div>' +
        '<div>' +
        '<h3>' + user.name + '</h3>' +
        '<p style="color: #888;">' + user.location + ', ' + user.country + '</p>' +
        '</div>' +
        '</div>' +
        '<p style="color: #aaa; font-size: 14px; margin: 10px 0;">' + user.bio + '</p>' +
        '<div style="display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0;">';
    
    if (user.genres) {
        user.genres.forEach(function(g) {
            html += '<span style="background: #333; padding: 4px 10px; border-radius: 15px; font-size: 12px; color: #aaa;">' + g + '</span>';
        });
    }
    
    html += '</div><div style="display: flex; gap: 10px; margin-top: 15px;">';
    
    var likeButtonClass = user.isLiked ? 'btn-liked' : 'btn btn-secondary';
    var likeButtonText = user.isLiked ? 'Liked' : '❤ Like';
    
    html += '<button class="' + likeButtonClass + '" style="flex: 1;" onclick="event.stopPropagation(); likeUser(' + user.id + ')">' + likeButtonText + '</button>';
    
    if (user.requestStatus === 'requested') {
        html += '<button class="btn btn-requested" style="flex: 1;" disabled onclick="event.stopPropagation();">Requested</button>';
    } else if (user.isConnected) {
        html += '<button class="btn btn-connected" style="flex: 1;" onclick="event.stopPropagation(); openDirectMessage(\'' + user.name + '\', \'' + user.type + '\')">Message</button>';
    } else {
        html += '<button class="btn btn-primary" style="flex: 1;" onclick="event.stopPropagation(); connectUser(' + user.id + ')">Connect</button>';
    }
    
    html += '</div>';
    
    card.innerHTML = html;
    return card;
}

// Match/Explore functions
function loadMatchCard() {
    var user = users[currentMatchIndex % users.length];
    var card = document.getElementById('matchCard');
    if (!card) return;
    
    var badgeClass = 'badge-' + user.type;
    var avatarStyle = user.color ? 'background: ' + user.color : 'background: #667eea';
    
    var showCalendarMatch = false;
    if (profileData.role && ((profileData.role === 'artist' && (user.type === 'venue' || user.type === 'promoter')) ||
        ((profileData.role === 'venue' || profileData.role === 'promoter') && user.type === 'artist'))) {
        showCalendarMatch = Math.random() > 0.7;
    }
    
    var connectButtonHtml = '';
    if (user.requestStatus === 'requested') {
        connectButtonHtml = '<button class="btn btn-requested" style="width: 100%; margin-top: 20px;" disabled>Requested</button>';
    } else if (user.isConnected) {
        connectButtonHtml = '<button class="btn btn-connected" style="width: 100%; margin-top: 20px;" onclick="openDirectMessage(\'' + user.name + '\', \'' + user.type + '\')">Message</button>';
    } else {
        connectButtonHtml = '<button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="connectMatch()">Connect</button>';
    }
    
    card.innerHTML = 
        (showCalendarMatch ? '<div class="calendar-match-flag">📅 Calendar Match</div>' : '') +
        '<div class="user-badge ' + badgeClass + '">' + user.type.toUpperCase() + '</div>' +
        '<div class="match-avatar" style="' + avatarStyle + '">' + user.name.charAt(0) + '</div>' +
        '<h2>' + user.name + '</h2>' +
        '<p style="color: #888;">' + user.location + ', ' + user.country + '</p>' +
        '<p style="margin: 20px 0; color: #aaa;">' + user.bio + '</p>' +
        '<button style="background: none; border: none; color: #ff3366; text-decoration: underline; cursor: pointer; font-size: 14px;" onclick="showFullProfile(users[' + (currentMatchIndex % users.length) + '])">See more</button>' +
        '<div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 20px 0;">' +
        user.genres.map(function(g) { return '<span style="background: #333; padding: 5px 10px; border-radius: 15px; font-size: 12px;">' + g + '</span>'; }).join('') +
        '</div>' +
        '<div class="match-actions">' +
        '<button class="match-btn pass" onclick="nextMatch()">✖</button>' +
        '<button class="match-btn like" onclick="likeMatch()">❤</button>' +
        '</div>' +
        connectButtonHtml;
}

function nextMatch() {
    currentMatchIndex++;
    loadMatchCard();
}

function likeMatch() {
    var user = users[currentMatchIndex % users.length];
    user.isLiked = true;
    nextMatch();
}

function connectMatch() {
    var user = users[currentMatchIndex % users.length];
    user.requestStatus = 'requested';
    loadMatchCard();
}

// User actions
function connectUser(id) {
    var user = users.find(function(u) { return u.id === id; });
    if (user) {
        user.requestStatus = 'requested';
        // Refresh the current view
        if (document.getElementById('fullProfile').classList.contains('active')) {
            // If we're in full profile view, refresh it
            showFullProfile(user);
        }
        filterSearchResults();
        loadMatchCard();
    }
}

function likeUser(id) {
    var user = users.find(function(u) { return u.id === id; });
    if (user) {
        user.isLiked = !user.isLiked;
        // Refresh the current view
        if (document.getElementById('fullProfile').classList.contains('active')) {
            showFullProfile(user);
        }
        filterSearchResults();
    }
}

// Messages
function openChat(name, type) {
    document.getElementById('chatListView').style.display = 'none';
    document.getElementById('chatConversationView').style.display = 'block';
    document.getElementById('chatTitle').innerHTML = name + '<span class="user-type-indicator">' + type + '</span>';
    
    var messages = document.getElementById('chatMessages');
    messages.innerHTML = 
        '<div class="message received" data-original="Hi, I\'m interested in booking you for our event!">' +
        'Hi, I\'m interested in booking you for our event!' +
        '<button class="translate-btn" onclick="toggleTranslate(this)">Translate</button>' +
        '</div>' +
        '<div class="message sent">That sounds great! When is the event?</div>' +
        '<div class="message received" data-original="October 16th in Tokyo. We can offer 1000€ plus accommodation.">' +
        'October 16th in Tokyo. We can offer 1000€ plus accommodation.' +
        '<button class="translate-btn" onclick="toggleTranslate(this)">Translate</button>' +
        '</div>';
}

function backToChats() {
    document.getElementById('chatListView').style.display = 'block';
    document.getElementById('chatConversationView').style.display = 'none';
}

function sendMessage() {
    var input = document.getElementById('messageInput');
    var msg = input.value.trim();
    if (!msg) return;
    
    var messages = document.getElementById('chatMessages');
    var div = document.createElement('div');
    div.className = 'message sent';
    div.textContent = msg;
    messages.appendChild(div);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
}

function toggleTranslate(btn) {
    var msg = btn.parentElement;
    var original = msg.getAttribute('data-original');
    var targetLang = document.getElementById('translationLanguage').value || settingsData.translationLanguage;
    
    if (btn.textContent === 'Translate' || btn.textContent === translations[currentLang].translate) {
        if (messageTranslations[original] && messageTranslations[original][targetLang]) {
            msg.childNodes[0].textContent = messageTranslations[original][targetLang];
            btn.textContent = translations[currentLang].show_original || 'Show Original';
        }
    } else {
        msg.childNodes[0].textContent = original;
        btn.textContent = translations[currentLang].translate || 'Translate';
    }
}

function openDirectMessage(name, type) {
    // Switch to messages tab
    document.querySelectorAll('.tab-content').forEach(function(content) {
        content.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab').forEach(function(tab) {
        tab.classList.remove('active');
    });
    
    document.getElementById('messages').classList.add('active');
    document.querySelectorAll('.nav-tab')[3].classList.add('active');
    
    openChat(name, type);
}

// Calendar functions
function openCalendar() {
    document.getElementById('calendarModal').classList.add('active');
    generateCalendar();
}

function closeCalendar() {
    document.getElementById('calendarModal').classList.remove('active');
}

function setupCalendarSelection() {
    // Handled in generateCalendar now
}

function generateCalendar() {
    var grid = document.getElementById('calendarGrid');
    var monthTitle = document.getElementById('calendarMonth');
    
    if (!grid || !monthTitle) return;
    
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'];
    
    monthTitle.textContent = months[currentMonth] + ' ' + currentYear;
    
    var firstDay = new Date(currentYear, currentMonth, 1).getDay();
    var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    grid.innerHTML = '';
    
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function(day) {
        var dayHeader = document.createElement('div');
        dayHeader.style.cssText = 'padding: 10px; text-align: center; font-weight: bold; color: #888;';
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });
    
    for (var i = 0; i < firstDay; i++) {
        grid.appendChild(document.createElement('div'));
    }
    
    for (var day = 1; day <= daysInMonth; day++) {
        var dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        var dateKey = currentYear + '-' + (currentMonth + 1) + '-' + day;
        dayElement.setAttribute('data-date', dateKey);
        
        if (availableDates.includes(dateKey)) {
            dayElement.classList.add('available');
        }
        
        // Add drag selection
        dayElement.addEventListener('mousedown', function(e) {
            isSelectingDates = true;
            dateSelectionStart = this;
            this.classList.add('selecting');
            e.preventDefault();
        });
        
        dayElement.addEventListener('mouseenter', function() {
            if (isSelectingDates) {
                this.classList.add('selecting');
            }
        });
        
        grid.appendChild(dayElement);
    }
    
    // Mouse up handler for calendar selection
    grid.addEventListener('mouseup', function() {
        if (isSelectingDates) {
            document.querySelectorAll('.calendar-day.selecting').forEach(function(day) {
                day.classList.remove('selecting');
                day.classList.add('available');
                var dateKey = day.getAttribute('data-date');
                if (dateKey && !availableDates.includes(dateKey)) {
                    availableDates.push(dateKey);
                }
            });
            isSelectingDates = false;
        }
    });
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar();
}

// RA Events
function openRAEvents(raUrl) {
    if (!raUrl || raUrl === '#') {
        alert('No Resident Advisor profile linked');
        return;
    }
    window.open(raUrl + '/past-events', '_blank');
}

// Profile picture
function updateProfilePic(event) {
    var file = event.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(e) {
        var avatar = event.target.parentElement;
        avatar.innerHTML = '<img src="' + e.target.result + '" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">';
    };
    reader.readAsDataURL(file);
}

// Close dropdowns on outside click
document.addEventListener('click', function(e) {
    if (!e.target.closest('#genreSelector') && !e.target.closest('#genreList')) {
        document.getElementById('genreList').classList.remove('active');
        document.getElementById('genreSelector').classList.remove('active');
    }
    
    if (!e.target.closest('.icon-btn') && !e.target.closest('.notifications')) {
        document.getElementById('notificationsPanel').classList.remove('active');
    }
    
    if (e.target.classList.contains('modal') || e.target.classList.contains('calendar-modal')) {
        e.target.classList.remove('active');
    }
});