<template>
  <div class="about-page">
    <!-- Hero Section -->
    <div class="hero-section position-relative overflow-hidden py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 text-center text-lg-start mb-4 mb-lg-0">
            <h1 class="display-3 fw-bold text-gradient mb-4">
              Revolutioniere dein Lernen mit KI
            </h1>
            <p class="lead mb-4 text-muted">
              Verwandle deine PDF-Dokumente automatisch in intelligente
              Karteikarten. Entwickelt von Studenten für Studenten an der DHBW
              Mosbach.
            </p>
            <div
              class="d-flex gap-3 justify-content-center justify-content-lg-start"
            >
              <button class="btn btn-primary btn-lg px-4">Jetzt starten</button>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image">
              <img
                src="\img\color-splash-wallpaper-wallpapers-free_9597536.jpg"
                alt="AI Learning Platform"
                class="img-fluid rounded-4 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section py-5 bg-light">
      <div class="container">
        <div class="row g-4">
          <div
            class="col-md-4"
            v-for="(feature, index) in features"
            :key="index"
          >
            <div class="card h-100 border-0 shadow-sm hover-card">
              <div class="card-body text-center p-4">
                <div class="feature-icon mb-3">
                  <i :class="feature.icon"></i>
                </div>
                <h3 class="h4 mb-3">{{ feature.title }}</h3>
                <p class="text-muted mb-0">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tech Stack Section -->
    <div class="tech-stack-section py-5">
      <div class="container">
        <h2 class="text-center mb-5">Unsere Technologie</h2>
        <div class="row justify-content-center g-4">
          <div
            class="col-6 col-md-3"
            v-for="(tech, index) in techStack"
            :key="index"
          >
            <div class="tech-card text-center p-4 rounded-4 bg-white shadow-sm">
              <i :class="tech.icon + ' display-4 mb-3'"></i>
              <h4 class="h5">{{ tech.name }}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Section -->
    <div class="team-section py-5 bg-light">
      <div class="container">
        <h2 class="text-center mb-5">Universitätsprojekt mit Zukunft</h2>
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4 text-center">
                <p class="lead mb-4">
                  Ein innovatives Projekt, das im Rahmen der
                  Webengineering-Vorlesung entstanden ist und kontinuierlich
                  weiterentwickelt wird. Unser Ziel ist es, das Lernen für
                  Studierende effizienter und effektiver zu gestalten.
                </p>

                <div class="d-flex justify-content-center gap-4">
                  <a href="https://github.com/CookieClickr" target="_blank">
                    <button class="btn btn-outline-primary">
                      <i class="bi bi-github me-2"></i>GitHub
                    </button>
                  </a>
                  <button class="btn btn-outline-primary">
                    <i class="bi bi-envelope me-2"></i>Kontakt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  data() {
    return {
      features: [
        {
          icon: 'bi bi-braces-asterisk',
          title: 'KI-Analyse',
          description:
            'Automatische Umwandlung von PDF-Dokumenten in strukturierte Karteikarten',
        },
        {
          icon: 'bi bi-lightning-charge',
          title: 'Schnell & Effizient',
          description:
            'Spare Zeit beim Erstellen von Lernmaterialien durch KI-Unterstützung',
        },
        {
          icon: 'bi bi-cloud-arrow-up',
          title: 'Cloud-basiert',
          description:
            'Greife von überall auf deine Karteikarten zu und teile sie mit anderen',
        },
      ],
      techStack: [
        { icon: 'bi bi-broadcast', name: 'Vue.js' },
        { icon: 'bi bi-server', name: 'Node.js' },
        { icon: 'bi bi-database', name: 'SQLite' },
        { icon: 'bi bi-cpu', name: 'KI-Engine' },
      ],
    }
  },
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(45deg, #2196f3, #673ab7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hover-card {
  transition: transform 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  color: #2196f3;
}

.tech-card {
  transition: all 0.3s ease;
}

.tech-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.hero-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.hero-image img {
  transition: transform 0.3s ease;
}

.hero-image:hover img {
  transform: scale(1.02);
}
</style>
