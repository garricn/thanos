// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import ClickableButton from '../components/ClickableButton';

export function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Web App</h1>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Button Demo</h2>
        <ClickableButton />
      </div>
    </div>
  );
}

export default App;
