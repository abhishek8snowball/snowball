import React from "react";
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const DomainForm = ({ domain, setDomain, loading, onSubmit, onClose }) => (
  <Card className="mb-6 border border-[#b0b0d8] bg-white">
    <CardHeader>
      <CardTitle className="text-[#4a4a6a]">Domain Analysis</CardTitle>
    </CardHeader>
    <CardContent>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-[#4a4a6a] mb-2">
            Enter Domain
          </label>
          <Input
            id="domain"
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="Enter brand domain (e.g. example.com)"
            disabled={loading}
            className="border-[#b0b0d8] focus:border-[#6658f4] focus:ring-[#6658f4]"
          />
          <p className="mt-1 text-sm text-[#4a4a6a]">
            Enter a domain without http:// or www (e.g., google.com, amazon.com)
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            type="submit"
            disabled={loading || !domain.trim()}
            className="flex-1 gradient-primary hover:shadow-lg transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Analyzing...
              </div>
            ) : (
              'Analyze Domain'
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-[#b0b0d8] text-[#4a4a6a] hover:bg-[#d5d6eb]"
          >
            Cancel
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
);

export default DomainForm;