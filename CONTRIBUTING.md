# Contributing to SCM Platform

Thank you for your interest in contributing! SCM Platform is an open-source project built to solve real supply chain problems.

---

## 👤 Primary Contributor

**Ashok Kumar V** — [@Ashok007-cmd](https://github.com/Ashok007-cmd)

Every line of code, every pipeline, and every architecture decision in this project was designed and built by Ashok Kumar. This project represents his first end-to-end production system and is an active portfolio project.

---

## 🤝 How to Contribute

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/SCM-Platform.git
cd SCM-Platform
git remote add upstream https://github.com/Ashok007-cmd/SCM-Platform.git
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 3. Make Your Changes

- Follow the existing code style and project structure
- Write clear, self-documenting code
- Add/update tests for any new functionality

### 4. Test Locally

```bash
# Frontend
cd frontend && npm install && npm run dev
npm run test        # run Vitest tests
npm run lint        # ESLint check

# Backend (Spring Boot)
cd backend/spring-services
./mvnw test

# AI/ML Service
cd backend/ai-ml-services
pip install -r requirements.txt
pytest
```

### 5. Submit a Pull Request

- Write a clear PR title and description
- Reference any related issues
- Ensure all CI checks pass

---

## 📋 Contribution Areas

| Area | Description |
|------|-------------|
| 🐛 Bug Fixes | Fix issues in the frontend, backend, or ML service |
| ✨ New Features | Add modules or improve existing SCM functionality |
| 📊 Analytics | Improve forecasting models or dashboard charts |
| 🧪 Tests | Increase test coverage |
| 📚 Docs | Improve documentation, add examples |
| 🎨 UI/UX | Enhance dashboard design or accessibility |

---

## 🚫 What We Don't Accept

- Breaking changes without discussion
- PRs that reduce test coverage significantly
- Changes that conflict with the project's MIT license

---

## 📜 Code of Conduct

Be respectful. This is a collaborative, open-source space — all constructive contributions are welcome.

---

## 📬 Contact

For questions or to discuss larger contributions, reach out via:
- **GitHub Issues**: [Open an issue](https://github.com/Ashok007-cmd/SCM-Platform/issues)
- **Email**: vashokkumar3655@gmail.com
- **LinkedIn**: [Ashok Kumar V](https://www.linkedin.com/in/ashok-kumar-v)

---

*MIT License · Built by [Ashok Kumar V](https://github.com/Ashok007-cmd)*
