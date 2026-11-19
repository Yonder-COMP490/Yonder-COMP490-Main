# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## API keys

The Maps page needs two keys.

1. In the top folder, on `.env`, add your Google Maps key:
```
VITE_GOOGLE_MAPS_API_KEY=your-key-here
```

2. In `backend/.env`, add your SerpApi key:
```
SERPAPI_KEY=your-key-here
```

3. Start the backend (`cd backend`, then `.\mvnw.cmd spring-boot:run`).

4. Run `npm run dev`, then open http://localhost:5173/maps

Never commit your real keys. The `.env` files are ignored by git.
