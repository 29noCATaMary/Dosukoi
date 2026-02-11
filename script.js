// v=25: 地図の分離、レポート一覧対応、永続化デバッグ
console.log("=== SCRIPT START ===");

// Supabase設定
const SUPABASE_URL = 'https://gjvxavvhfdgnnudpqqfa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdnhhdnZoZmRnbm51ZHBxcWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTIyNjgsImV4cCI6MjA4NjIyODI2OH0.WcVi6fT5q0gojOt4ZEOKzMm6xaO4qrvXvb7LtCZCN_8';

let supabaseClient = null;

const handleUraToggle = () => {
    console.log("Ura toggle executing");
    const body = document.body;
    const hero = document.querySelector('.hero');
    const heroTitle = document.querySelector('.hero-content h1');
    const heroText = document.querySelector('.hero-content p');
    const aboutTitle = document.querySelector('#about h2');
    const aboutText = document.querySelector('#about p');
    const logoEle = document.querySelector('.logo');
    const toggleBtn = document.getElementById('ura-toggle');

    const isUra = body.classList.toggle('ura-mode');

    if (isUra) {
        if (toggleBtn) toggleBtn.textContent = '🍜 表口';
        if (logoEle) logoEle.textContent = '裏どすこい';
        if (heroTitle) heroTitle.innerHTML = '米一粒。<br>どすこい。';
        if (heroText) heroText.innerHTML = 'ラーメン以外を愛し、定食に愛された者たちの集い。<br>デジタルライフ？いや、これはリアルライフだ。';
        if (hero) hero.style.backgroundImage = "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('ura_dosukoi_tonkatsu_hero.png')";
        if (aboutTitle) aboutTitle.textContent = '裏どすこいとは';
        if (aboutText) aboutText.innerHTML = `我々は日々、クライアントの「デジタル・エクスペリエンス（DX）」を最適化している。<br><br>しかし、真にアップデートすべきは「我々の本能」ではないのか？<br><br>麺という既成概念（フレームワーク）を捨て、スープという秩序（ロジック）を離れる。 未知なる味覚の荒野（フロンティア）で、ただひたすらに「食の快楽」をハックする。<br><br>それが「裏どすこい」だ。<br><br><small>※一般の方はログインできません。我々の「狂気」を味わってください。</small>`;
    } else {
        if (toggleBtn) toggleBtn.textContent = '🍚 裏口';
        if (logoEle) logoEle.textContent = 'どすこいラーメン部';
        if (heroTitle) heroTitle.innerHTML = '一杯入魂。<br>どすこい。';
        if (heroText) heroText.innerHTML = 'ラーメンを愛し、ラーメンに愛された者たちの集い。';
        if (hero) hero.style.backgroundImage = "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('dosukoi_ramen_hero.png')";
        if (aboutTitle) aboutTitle.textContent = 'どすこいラーメン部とは';
        if (aboutText) aboutText.innerHTML = `我々は日々、クライアントのデジタルライフをプランニングしている。<br>しかし、真にプランニングすべきは「今日の一杯」ではないのか？<br>麺と向き合い、スープと対話し、一杯の宇宙を感じる。<br>それが「どすこいラーメン部」だ。<br><small>※一般の方は入部できません。我々の「どすこい」を感じてください。</small>`;
    }

    // ランキングの更新をトリガー
    if (typeof window.updateRanking === 'function') {
        window.updateRanking(isUra);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM Ready");

    // Supabase初期化
    if (window.supabase && window.supabase.createClient) {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("✓ Supabase initialized");
        } catch (e) {
            console.error("✗ Supabase init error:", e);
        }
    }

    // 裏口ボタン
    const toggleBtn = document.getElementById('ura-toggle');
    if (toggleBtn) {
        toggleBtn.onclick = handleUraToggle;
        console.log("Toggle handler attached");
    }

    // モバイルメニュー
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.onclick = () => {
            mainNav.classList.toggle('active');
            mobileMenuBtn.textContent = mainNav.classList.contains('active') ? '✖' : '☰';
        };

        // リンククリック時に閉じる
        mainNav.querySelectorAll('a').forEach(link => {
            link.onclick = () => {
                mainNav.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
            };
        });
    }

    // 地図初期化 (Leaflet.js)
    const mapContainer = document.getElementById('map');
    if (mapContainer && window.L) {
        console.log("Initializing map...");
        const map = L.map('map').setView([35.681236, 139.767125], 11); // 東京駅中心

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // 拠点の追加
        const locations = [
            { name: "どすこいラーメン部 秘密本部 (汐留)", lat: 35.664, lng: 139.761 },
            { name: "どすこい巡業拠点 (新宿)", lat: 35.690, lng: 139.700 },
            { name: "どすこい巡業拠点 (渋谷)", lat: 35.658, lng: 139.701 }
        ];

        locations.forEach(loc => {
            L.marker([loc.lat, loc.lng]).addTo(map)
                .bindPopup(`<b>${loc.name}</b>`);
        });

        // 動的レポートマーカーの追加
        if (supabaseClient) {
            Promise.resolve().then(async () => {
                let { data: dynamicReports, error: mapError } = await supabaseClient
                    .from('reports')
                    .select('shop_name, lat, lng, review, taste_tendency, profiles(nickname)')
                    .not('lat', 'is', null)
                    .not('lng', 'is', null);

                // Fallback
                if (mapError && mapError.message.includes("relationship")) {
                    console.warn("Map relationship error, falling back to flat select.");
                    const res = await supabaseClient
                        .from('reports')
                        .select('shop_name, lat, lng, review, taste_tendency')
                        .not('lat', 'is', null)
                        .not('lng', 'is', null);
                    dynamicReports = res.data;
                }

                if (dynamicReports) {
                    dynamicReports.forEach(rep => {
                        const nick = (rep.profiles && rep.profiles.nickname) ? rep.profiles.nickname : "不明な部員";
                        const taste = rep.taste_tendency ? ` [${rep.taste_tendency}]` : "";
                        L.marker([rep.lat, rep.lng]).addTo(map)
                            .bindPopup(`
                                <div class="map-popup">
                                    <h3 style="margin:0 0 5px 0;">${rep.shop_name}</h3>
                                    <p style="margin:0; font-size:0.8rem; color:#666;">報告者: ${nick}</p>
                                    <p style="margin:10px 0; font-size:0.85rem; line-height:1.4;">${rep.review.substring(0, 40)}${rep.review.length > 40 ? '...' : ''}</p>
                                    <a href="shop-details.html?id=${rep.id || ''}&shop_name=${encodeURIComponent(rep.shop_name)}" class="cta-button" style="display:block; text-align:center; padding:5px; font-size:0.8rem; text-decoration:none;">戦果を見る</a>
                                </div>
                            `);
                    });
                }
            });
        }
    }

    // ログインボタン
    const loginTrigger = document.getElementById('login-trigger-header');
    if (loginTrigger) {
        loginTrigger.onclick = async (e) => {
            e.preventDefault();

            // ログイン済みかチェック
            if (supabaseClient) {
                try {
                    const { data: { session } } = await supabaseClient.auth.getSession();
                    if (session) {
                        if (confirm('ログアウトしますか？')) {
                            await supabaseClient.auth.signOut();
                            location.reload();
                        }
                        return;
                    }
                } catch (err) {
                    console.error("Session check error:", err);
                }
            }

            const modal = document.getElementById('login-modal');
            if (modal) modal.style.display = 'block';
        };
        console.log("Login handler attached");
    }

    // セッションチェックとUI更新
    if (supabaseClient) {
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session && loginTrigger) {
                const { data: profile } = await supabaseClient
                    .from('profiles')
                    .select('nickname, is_admin, bio, photo_url')
                    .eq('id', session.user.id)
                    .single();

                if (profile && profile.nickname) {
                    loginTrigger.textContent = profile.nickname + (profile.is_admin ? ' (管理者)' : '');
                    loginTrigger.style.color = '#FFC107';
                    loginTrigger.style.fontWeight = 'bold';
                    console.log("✓ User logged in:", profile.nickname, "Admin:", profile.is_admin);
                    window.isAdmin = profile.is_admin;
                    window.currentUserProfile = profile; // Store for editing

                    const reportNav = document.getElementById('report-nav');
                    if (reportNav) reportNav.style.display = 'block';

                    const editNav = document.getElementById('edit-profile-nav');
                    if (editNav) editNav.style.display = 'block';
                }
            }
        } catch (err) {
            console.error("Session UI update error:", err);
        }
    }

    // モーダルを閉じる
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            const modal = document.getElementById('login-modal');
            if (modal) modal.style.display = 'none';
        };
    }

    // プロフィール編集モーダル制御
    window.openEditProfile = () => {
        if (!window.currentUserProfile) return;
        document.getElementById('edit-nickname').value = window.currentUserProfile.nickname || '';
        document.getElementById('edit-bio').value = window.currentUserProfile.bio || '';
        document.getElementById('edit-profile-modal').style.display = 'block';
    };

    window.closeEditProfile = () => {
        document.getElementById('edit-profile-modal').style.display = 'none';
    };

    // モーダル外をクリックで閉じる
    window.onclick = (event) => {
        const loginModal = document.getElementById('login-modal');
        const editModal = document.getElementById('edit-profile-modal');
        if (event.target === loginModal) loginModal.style.display = 'none';
        if (event.target === editModal) editModal.style.display = 'none';
    };

    // タブ切り替え
    window.switchTab = (tab) => {
        if (tab === 'signup') {
            const secret = prompt('入部希望者か？合言葉を言え。');
            if (secret !== '7618') {
                alert('違うな。出直してこい。');
                return;
            }
        }
        const forms = document.querySelectorAll('.auth-form');
        const buttons = document.querySelectorAll('.tab-btn');
        forms.forEach(f => f.style.display = 'none');
        buttons.forEach(b => b.classList.remove('active'));

        if (tab === 'login') {
            if (forms[0]) forms[0].style.display = 'block';
            if (buttons[0]) buttons[0].classList.add('active');
        } else {
            if (forms[1]) forms[1].style.display = 'block';
            if (buttons[1]) buttons[1].classList.add('active');
        }
    };

    // ログインフォーム処理
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            if (!supabaseClient) {
                alert("サーバー接続準備中...");
                return;
            }

            const id = document.getElementById('login-id').value;
            const pass = document.getElementById('login-pass').value;
            const email = id.includes('@') ? id : `${id}@dosukoi.club`;

            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: pass
                });

                if (error) {
                    alert("認証失敗: " + error.message);
                } else {
                    alert("おかえり！");
                    location.reload();
                }
            } catch (err) {
                console.error("Login error:", err);
                alert("ログインエラーが発生しました");
            }
        };
        console.log("✓ Login form ready");
    }

    // サインアップフォーム処理
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.onsubmit = async (e) => {
            e.preventDefault();
            if (!supabaseClient) {
                alert("サーバー接続準備中...");
                return;
            }

            const nick = document.getElementById('signup-nickname').value;
            const id = document.getElementById('signup-id').value;
            const pass = document.getElementById('signup-pass').value;
            const bio = document.getElementById('signup-bio').value;
            const photoFile = document.getElementById('signup-photo').files[0];
            const email = id.includes('@') ? id : `${id}@dosukoi.club`;

            let photoData = '';
            if (photoFile) {
                photoData = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(photoFile);
                });
            }

            try {
                const { data, error } = await supabaseClient.auth.signUp({
                    email: email,
                    password: pass
                });

                if (error) {
                    alert("登録失敗: " + error.message);
                    return;
                }

                if (data.user) {
                    // プロフィール作成
                    const { error: profileError } = await supabaseClient
                        .from('profiles')
                        .insert([{
                            id: data.user.id,
                            nickname: nick,
                            bio: bio || '',
                            photo_url: photoData
                        }]);

                    if (profileError) {
                        console.error("Profile error:", profileError);
                    }

                    alert("入部完了！ログインしてください。");
                    switchTab('login');
                }
            } catch (err) {
                console.error("Signup error:", err);
                alert("登録エラーが発生しました");
            }
        };
        console.log("✓ Signup form ready");
    }

    // プロフィール編集フォーム処理
    const editForm = document.getElementById('edit-profile-form');
    if (editForm) {
        editForm.onsubmit = async (e) => {
            e.preventDefault();
            if (!supabaseClient) return;

            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) return;

            const nick = document.getElementById('edit-nickname').value;
            const bio = document.getElementById('edit-bio').value;
            const photoFile = document.getElementById('edit-photo').files[0];

            let photoData = window.currentUserProfile ? window.currentUserProfile.photo_url : '';
            if (photoFile) {
                photoData = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(photoFile);
                });
            }

            try {
                const { error } = await supabaseClient
                    .from('profiles')
                    .update({
                        nickname: nick,
                        bio: bio,
                        photo_url: photoData
                    })
                    .eq('id', session.user.id);

                if (error) {
                    alert("更新に失敗しました: " + error.message);
                } else {
                    alert("プロフィールを更新しました！");
                    location.reload();
                }
            } catch (err) {
                console.error("Profile update error:", err);
                alert("エラーが発生しました");
            }
        };
    }

    // ランキング（お店一覧）の更新機能
    window.updateRanking = async (isUra, filter = 'all') => {
        const rankingList = document.getElementById('ranking-list');
        if (!rankingList) return;

        rankingList.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">修行中（読込中）...</p>';

        try {
            // Supabaseからレポート（お店情報）を取得
            // shop_type でフィルタリング（表なら通常のラーメン、裏なら定食など）
            let query = supabaseClient.from('reports').select('*, profiles(nickname)');

            if (isUra) {
                // 裏モード：ラーメン以外（その他・裏どすこい）
                query = query.eq('shop_type', 'その他（裏どすこい）');
            } else {
                // 表モード：ラーメン全般
                query = query.neq('shop_type', 'その他（裏どすこい）');
            }

            let { data: reports, error } = await query;

            // Fallback for relationship error
            if (error && error.message.includes("relationship")) {
                console.warn("Ranking relationship error, falling back to flat select.");
                let fallbackQuery = supabaseClient.from('reports').select('*');
                if (isUra) {
                    fallbackQuery = fallbackQuery.eq('shop_type', 'その他（裏どすこい）');
                } else {
                    fallbackQuery = fallbackQuery.neq('shop_type', 'その他（裏どすこい）');
                }
                const res = await fallbackQuery;
                reports = res.data;
                error = res.error;
            }

            if (error) throw error;

            if (!reports || reports.length === 0) {
                // データがない場合のサンプル（初回用）
                const samples = isUra ? [
                    { shop_name: "キッチン・どすこい", shop_type: "定食", rating: 5, review: "ここのトンテキは世界を救う。", id: 's1' },
                    { shop_name: "カレーショップ・ライス", shop_type: "カレー", rating: 4, review: "無限に食べられるスパイスの魔術。", id: 's2' }
                ] : [
                    { shop_name: "麺処 どすこい", shop_type: "豚骨魚介", rating: 5, review: "濃厚な魚介の旨味が体に染み渡る一本。", id: 's3' },
                    { shop_name: "塩の王様", shop_type: "塩", rating: 4, review: "透き通ったスープに宇宙を感じた。", id: 's4' }
                ];

                renderCards(samples, filter);
            } else {
                renderCards(reports, filter);
            }
        } catch (err) {
            console.error("Ranking update error:", err);
            rankingList.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">名簿の取得に失敗しました。再度お試しください。</p>';
        }
    };

    const renderCards = (items, filter) => {
        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = '';

        const filtered = filter === 'all' ? items : items.filter(i => i.shop_type === filter);

        if (filtered.length === 0) {
            rankingList.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">該当するお店がまだありません。</p>';
            return;
        }

        filtered.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card ranking-card';
            card.innerHTML = `
                <div class="rank-badge">${index + 1}位</div>
                <h3>${item.shop_name}</h3>
                <p><strong>${item.shop_type}${item.taste_tendency ? ' [' + item.taste_tendency + ']' : ''}</strong></p>
                ${item.photo_url ? `<div style="margin: 0.8rem 0; border-radius: 8px; overflow: hidden; height: 120px;"><img src="${item.photo_url}" style="width: 100%; height: 100%; object-fit: cover;" alt="ラーメン写真"></div>` : ''}
                <div class="rating" style="color: #FFC107; margin: 0.5rem 0;">${'★'.repeat(item.rating || 0)}${'☆'.repeat(5 - (item.rating || 0))}</div>
                <p style="font-size: 0.9rem;">"${item.review || ''}"</p>
                <small style="display:block; margin-top:5px; color:#999;">報告者: ${item.profiles ? item.profiles.nickname : '不明'}</small>
            `;
            rankingList.appendChild(card);
        });
    };

    // フィルターボタンのイベント設定
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.onclick = () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            const isUra = document.body.classList.contains('ura-mode');
            window.updateRanking(isUra, filter);
        };
    });

    // 初期読み込み
    window.updateRanking(document.body.classList.contains('ura-mode'));

    console.log("=== INITIALIZATION COMPLETE ===");
});
