<template>
  <div class="main-view">
    <div class="welcome-container">
      <div class="curved-text-container">
        <svg width="400" height="100" class="welcome-svg">
          <defs>
            <path id="curve" d="M 50 80 Q 200 20 350 80" fill="transparent" />
          </defs>
          <text class="curved-text">
            <textPath href="#curve" startOffset="50%" text-anchor="middle">
              Welcome to
            </textPath>
          </text>
        </svg>
      </div>
      <div class="summaize-container">
        <h1 class="graffiti-text">
          Summ<span class="ai-highlight">AI</span>ze
        </h1>
        <div class="splatter-effect"></div>
      </div>
    </div>
    <div class="content-wrapper">
      <div class="main-content"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainView',
}
</script>

<style scoped>
.main-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 100vh;
}

.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 2vh;
  width: 100%;
}

.curved-text-container {
  position: relative;
  width: 400px;
  height: 100px;
  margin-bottom: -20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.welcome-svg {
  overflow: visible;
}

.curved-text {
  font-family: 'Ephesis', cursive;
  font-weight: 400;
  font-style: normal;
  font-size: 2.5em;
  fill: #333;
  filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.2));
}

.summaize-container {
  position: relative;
  text-align: center;
}

.graffiti-text {
  font-family: 'Impact', sans-serif;
  font-size: 6em;
  margin: 0;
  padding: 20px;
  background: linear-gradient(
    45deg,
    rgba(255, 0, 204, 0.6),
    rgba(51, 51, 255, 0.6),
    rgba(255, 153, 0, 0.6),
    rgba(102, 255, 102, 0.6)
  );
  background-blend-mode: screen;
  background-size: 200% 200%;
  animation: gradient-animation 20s ease infinite;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 4px 4px 0 rgba(0, 0, 0, 1);
}

.ai-highlight {
  font-weight: 900;
  text-shadow: 6px 6px 0 rgba(0, 0, 0, 1);
  position: relative;
  display: inline-block;
  transform: scale(1.1);
}

@keyframes gradient-animation {
  0% {
    background-position: 0% 0%;
  }
  25% {
    background-position: 100% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  75% {
    background-position: 0% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

@media (max-width: 768px) {
  .curved-text {
    font-size: 2em;
  }
  .graffiti-text {
    font-size: 4em;
  }
  .curved-text-container {
    width: 300px;
  }
}
</style>
