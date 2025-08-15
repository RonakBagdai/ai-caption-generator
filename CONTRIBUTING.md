# Contributing to AI Caption Generator

Thank you for your interest in contributing to the AI Caption Generator! We welcome contributions from the community and are pleased to have you join us.

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find that the issue has already been reported. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

1. **Fork the repository**
2. **Create a new branch** from `main` for your feature or bug fix
3. **Make your changes** in your feature branch
4. **Add or update tests** as needed
5. **Ensure the test suite passes**
6. **Make sure your code follows the existing style**
7. **Commit your changes** with a clear commit message
8. **Push your branch** to your fork
9. **Submit a pull request**

### Development Setup

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-caption-generator.git
   cd ai-caption-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Backend
   npm start
   
   # Frontend (in another terminal)
   cd frontend && npm run dev
   ```

## 📝 Coding Standards

### JavaScript/React Guidelines

- Use **ES6+** features where appropriate
- Use **functional components** with hooks for React
- Use **async/await** instead of promises where possible
- Write **clear, descriptive variable and function names**
- Add **comments** for complex logic
- Use **meaningful commit messages**

### Code Style

- Follow **Prettier** formatting
- Use **ESLint** for code quality
- Maintain **consistent indentation** (2 spaces)
- Use **semicolons**
- Use **single quotes** for strings

### Component Guidelines

- Keep components **small and focused**
- Use **PropTypes** or **TypeScript** for type checking
- Write **reusable components** when possible
- Follow **React best practices**

## 🧪 Testing

- Write **unit tests** for new features
- Ensure **existing tests pass**
- Test on **multiple browsers**
- Test **responsive design** on different screen sizes

## 📚 Documentation

- Update **README.md** if needed
- Add **code comments** for complex functions
- Update **API documentation** for new endpoints
- Include **examples** in documentation

## 🏷️ Commit Messages

Use clear and meaningful commit messages:

```
feat: add batch image upload functionality
fix: resolve authentication token expiry issue
docs: update API documentation
style: improve mobile responsiveness
refactor: optimize image processing service
test: add unit tests for caption generation
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

### 🔧 Technical Improvements
- **Performance optimizations**
- **Security enhancements**
- **Code refactoring**
- **Test coverage improvements**
- **Documentation updates**

### ✨ Features
- **New caption styles**
- **Additional language support**
- **UI/UX improvements**
- **Social media integrations**
- **Analytics features**

### 🐛 Bug Fixes
- **Cross-browser compatibility**
- **Mobile responsiveness issues**
- **API error handling**
- **Memory leaks**
- **Performance bottlenecks**

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] **Fork** the repository and create your branch from `main`
- [ ] **Run tests** and ensure they pass
- [ ] **Test your changes** thoroughly
- [ ] **Update documentation** if needed
- [ ] **Follow the coding standards**
- [ ] **Write clear commit messages**

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for features
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🤔 Questions?

If you have questions about contributing, feel free to:

- **Open an issue** with the `question` label
- **Contact the maintainers** via GitHub
- **Check existing discussions** for similar questions

## 🙏 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

Thank you for contributing to AI Caption Generator! 🚀
