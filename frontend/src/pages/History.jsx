import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiService } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const History = () => {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await apiService.getHistory();
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('History fetch error:', error);
      // Error is already handled by API interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this analysis?")) {
      return;
    }

    setDeleteLoading(id);
    try {
      await apiService.deleteHistory(id);
      toast.success("Analysis deleted successfully!");
      setHistory(history.filter(item => item._id !== id));
      if (selected && selected._id === id) {
        setSelected(null);
      }
    } catch (error) {
      console.error('Delete history error:', error);
      // Error is already handled by API interceptor
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Analysis History</h2>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
          </div>

          {selected && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Analysis Details</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <strong className="text-gray-900">URL:</strong>
                  <p className="mt-1 text-gray-700 break-all">{selected.url}</p>
                </div>
                
                {selected.tags && (
                  <div>
                    <strong className="text-gray-900">Tags:</strong>
                    <div className="mt-1 bg-gray-100 rounded-lg p-3 max-h-48 overflow-y-auto">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(selected.tags, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {selected.suggestion && (
                  <div>
                    <strong className="text-gray-900">Suggestion:</strong>
                    <div className="mt-1 bg-green-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {selected.suggestion}
                      </pre>
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  {formatDate(selected.createdAt)}
                </div>
              </div>
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No history found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your analysis history will appear here once you start analyzing domains or links.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelected(item)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.url}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleteLoading === item._id}
                      className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteLoading === item._id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;