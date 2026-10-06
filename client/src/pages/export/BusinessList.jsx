import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Waves, Search, Check, Copy, ArrowLeft, Loader2 } from "lucide-react";

export default function BusinessList() {
    const [token, setToken] = useState("");
    const [businesses, setBusinesses] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedName, setSelectedName] = useState("");
    const [businessId, setBusinessId] = useState("");
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const [authError, setAuthError] = useState("");
    const [validating, setValidating] = useState(false);

    const navigate = useNavigate();
    const API_URL = "https://gql.waveapps.com/graphql/public";

    const QUERY = `
  query ($page: Int!, $pageSize: Int!) {
    businesses(page: $page, pageSize: $pageSize) {
      edges { node { id name } }
    }
  }`;

    const fetchBusinesses = async () => {
        setLoading(true);
        setError("");
        setBusinesses([]);
        setSelectedName("");
        setBusinessId("");
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ query: QUERY, variables: { page: 1, pageSize: 100 } }),
            });
            const data = await res.json();
            setBusinesses(data.data.businesses.edges);
            setDropdownOpen(true);
        } catch {
            setError("Failed to load businesses. Check your token.");
        } finally {
            setLoading(false);
        }
    };

    const filtered = businesses.filter(b =>
        b.node.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectBusiness = (b) => {
        setSelectedName(b.node.name);
        setBusinessId(b.node.id);
        setSearch("");
        setDropdownOpen(false);
    };

    const copyId = () => {
        if (!businessId) return;
        navigator.clipboard.writeText(businessId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const validateAndConnect = async () => {
        if (!token.trim() || !businessId.trim()) {
            setAuthError("Both fields are required.");
            return;
        }
        setValidating(true);
        setAuthError("");
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ query: `query { business(id: "${businessId}") { id name } }` }),
            });
            const data = await res.json();
            if (data?.errors || !data?.data?.business) {
                setAuthError("Invalid credentials. Please check your API token and Business ID.");
            } else {
                navigate("/export/filter", { state: { apiToken: token, businessId } });
            }
        } catch {
            setAuthError("Connection failed. Please check your network.");
        } finally {
            setValidating(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-md">

                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 font-body font-medium mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to dashboard
                </button>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm shadow-slate-100 p-8">
                    <div className="text-center mb-7">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                            <Waves className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-heading font-bold text-slate-900">Connect a Wave account</h1>
                        <p className="text-sm text-slate-500 font-body mt-1.5">
                            Export invoice data from any Wave business using an API token.
                        </p>
                    </div>

                    {/* Step 1 */}
                    <div className="mb-5">
                        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide font-body">
                            Step 1 — API token
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                placeholder="Paste your Wave API token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && token.trim() && fetchBusinesses()}
                                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-body"
                            />
                            <button
                                onClick={fetchBusinesses}
                                disabled={!token.trim() || loading}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold font-heading px-4 rounded-lg flex items-center gap-1.5 transition-colors"
                            >
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                                {loading ? "Loading" : "Load"}
                            </button>
                        </div>
                        {error && <p className="text-xs text-red-500 font-body mt-2">{error}</p>}
                    </div>

                    {/* Step 2 */}
                    <div className="mb-5 relative">
                        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide font-body">
                            Step 2 — select business
                        </label>
                        <input
                            type="text"
                            placeholder={businesses.length === 0 ? "Load businesses first…" : "Search business name…"}
                            value={search}
                            disabled={businesses.length === 0}
                            onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); }}
                            onFocus={() => businesses.length > 0 && setDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setDropdownOpen(false), 160)}
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-body disabled:bg-slate-50 disabled:text-slate-300"
                        />
                        {dropdownOpen && filtered.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg shadow-slate-200/60 max-h-44 overflow-y-auto z-20">
                                {filtered.map((b) => (
                                    <div
                                        key={b.node.id}
                                        onMouseDown={() => selectBusiness(b)}
                                        className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-b-0"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                                            {b.node.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-700 font-body truncate">{b.node.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono truncate">{b.node.id}</p>
                                        </div>
                                        {businessId === b.node.id && <Check className="w-3.5 h-3.5 text-indigo-600 ml-auto flex-shrink-0" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected info */}
                    <div className={`rounded-xl p-3.5 mb-5 border ${businessId ? 'bg-indigo-50/60 border-indigo-100' : 'bg-slate-50 border-slate-200'}`}>
                        {businessId ? (
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                                        {selectedName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 font-body truncate">{selectedName}</p>
                                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">{businessId}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={copyId}
                                    className="flex items-center gap-1 text-xs font-medium font-body px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 transition-colors flex-shrink-0"
                                >
                                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 font-body">No business selected yet</p>
                        )}
                    </div>

                    {authError && (
                        <p className="text-xs text-red-500 font-body mb-4">{authError}</p>
                    )}

                    <button
                        disabled={!businessId}
                        onClick={validateAndConnect}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold font-heading py-3 rounded-xl transition-colors"
                    >
                        Connect and continue
                    </button>
                </div>
            </div>
        </div>
    );
}
