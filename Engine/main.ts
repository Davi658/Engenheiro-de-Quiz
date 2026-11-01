import './styles.css';
import { catalog } from './content/catalog';
import { mountApp } from './ui/app';

mountApp(document.getElementById('app')!, catalog, window.location.search);

