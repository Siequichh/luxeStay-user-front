import { useState, useEffect, useCallback } from 'react';
import { ubigeoService } from '../services/ubigeoService';

export function useUbigeo() {
  const [departments, setDepartments] = useState([]);
  const [provinces,   setProvinces]   = useState([]);
  const [districts,   setDistricts]   = useState([]);

  const [selectedDep,  setSelectedDep]  = useState('');
  const [selectedProv, setSelectedProv] = useState('');
  const [selectedDist, setSelectedDist] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    ubigeoService.getDepartments()
      .then(setDepartments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDep) {
      setProvinces([]);
      setDistricts([]);
      setSelectedProv('');
      setSelectedDist(null);
      return;
    }
    setLoading(true);
    ubigeoService.getProvinces(selectedDep)
      .then((data) => { setProvinces(data); setSelectedProv(''); setDistricts([]); setSelectedDist(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedDep]);

  useEffect(() => {
    if (!selectedDep || !selectedProv) {
      setDistricts([]);
      setSelectedDist(null);
      return;
    }
    setLoading(true);
    ubigeoService.getDistricts(selectedDep, selectedProv)
      .then((data) => { setDistricts(data); setSelectedDist(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedDep, selectedProv]);

  const handleDepChange = useCallback((code) => setSelectedDep(code), []);
  const handleProvChange = useCallback((code) => setSelectedProv(code), []);
  const handleDistChange = useCallback((id) => {
    const found = districts.find((d) => String(d.id) === String(id));
    setSelectedDist(found ?? null);
  }, [districts]);

  return {
    departments,
    provinces,
    districts,
    selectedDep,
    selectedProv,
    selectedDist,
    setSelectedDep: handleDepChange,
    setSelectedProv: handleProvChange,
    setSelectedDist: handleDistChange,
    loading,
    error,
  };
}

export function useUbigeoSearch(query) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      ubigeoService.search(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading };
}
