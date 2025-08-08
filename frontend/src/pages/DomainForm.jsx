import React from "react";
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const DomainForm = ({ domain, setDomain, loading, onSubmit, onClose }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>Domain Analysis</CardTitle>
    </CardHeader>
    <CardContent>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-foreground mb-2">
            Enter Domain
          </label>
          <Input
            id="domain"
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="Enter brand domain (e.g. example.com)"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Enter a domain without http:// or www (e.g., google.com, amazon.com)
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            type="submit"
            disabled={loading || !domain.trim()}
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
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
          >
            Cancel
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
);

export default DomainForm;