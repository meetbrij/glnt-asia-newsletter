import Layout from "./Layout.jsx";
import PrivateRoute from "@/components/PrivateRoute.jsx";
import AnalystDashboard from "./AnalystDashboard";
import SelectedNews from "./SelectedNews";
import PublishedNewsletters from "./PublishedNewsletters";
import ManagerDashboard from "./ManagerDashboard";
import ContentPerformance from "./ContentPerformance";
import ReaderEngagement from "./ReaderEngagement";
import Newsletter from "./Newsletter";
import Login from "./Login.jsx";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    AnalystDashboard: AnalystDashboard,
    SelectedNews: SelectedNews,
    PublishedNewsletters: PublishedNewsletters,
    ManagerDashboard: ManagerDashboard,
    ContentPerformance: ContentPerformance,
    ReaderEngagement: ReaderEngagement,
    Newsletter: Newsletter,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    console.log("currentPage: ", currentPage);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                    <PrivateRoute>
                        <AnalystDashboard />
                    </PrivateRoute>
                } />
                <Route path="/AnalystDashboard" element={
                    <PrivateRoute>
                        <AnalystDashboard />
                    </PrivateRoute>
                } />
                <Route path="/SelectedNews" element={
                    <PrivateRoute>
                        <SelectedNews/>
                    </PrivateRoute>
                } />
                <Route path="/PublishedNewsletters" element={
                    <PrivateRoute>
                        <PublishedNewsletters />
                    </PrivateRoute>
                } />
                <Route path="/ManagerDashboard" element={
                    <PrivateRoute>
                        <ManagerDashboard />
                    </PrivateRoute>
                } />
                <Route path="/ContentPerformance" element={
                    <PrivateRoute>
                        <ContentPerformance />
                    </PrivateRoute>
                } />
                <Route path="/ReaderEngagement" element={
                    <PrivateRoute>
                        <ReaderEngagement />
                    </PrivateRoute>
                } />
                <Route path="/Newsletter" element={<Newsletter />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}