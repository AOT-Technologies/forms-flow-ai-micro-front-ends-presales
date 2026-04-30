import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App({ basename = '/' }: { basename?: string }) {
  return (
    <Router basename={basename}>
      <AppRoutes />
    </Router>
  );
}

export default App;
