import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationMap = ({ trackingId }) => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await fetch(`/api/location/${trackingId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch location');
                }
                const data = await response.json();
                setLocation(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLocation();
        // Poll for location updates every 10 seconds
        const interval = setInterval(fetchLocation, 10000);
        return () => clearInterval(interval);
    }, [trackingId]);

    if (loading) return <div>Loading location...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!location) return <div>No location data available</div>;

    return (
        <div style={{ height: '400px', width: '100%' }}>
            <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[location.latitude, location.longitude]}>
                    <Popup>
                        Last updated: {new Date(location.updatedAt).toLocaleString()}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default LocationMap; 