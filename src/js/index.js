import "../css/input.css";
import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './components/App.jsx';
import Sites from './components/ui/Sites.jsx';
import LegislativeAction from './components/legislative/LegislativeAction.jsx';
import LegislativeActionHome from './components/legislative/LegislativeActionHome.jsx';

if (process.env.NODE_ENV === 'debug')
{
    setDebugLevel(1);
}




const $root = document.getElementById("app");
const root = createRoot($root);



const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null; // This component doesn't render anything
};



root.render(
    <BrowserRouter>
        <ScrollToTop />
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<BookCovers />} />
                <Route path="sites">
                    <Route index element={<Sites />} />
                </Route>
                <Route path="action">
                    <Route index element={<LegislativeActionHome />} />
                    <Route path=":type" element={<LegislativeAction />} />
                </Route>
                <Route path="formbook">
                    <Route path=":chapterId/:formId?" element={<FormbookLayout />} />
                </Route>
                <Route path="book">
                    <Route path=":bookId/:chapterId" element={<BonLayout />} />
                </Route>
            </Route>
        </Routes>
    </BrowserRouter>
);
