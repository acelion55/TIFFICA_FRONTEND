'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Import the map component dynamically with SSR disabled
const LiveMap = dynamic(() => import('./LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-50/50 rounded-[2.5rem]">
      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      <p className="font-bold text-slate-500">Mounting Map Interface...</p>
    </div>
  )
});

interface MapLocationTabProps {
  users: any[];
  kitchens: any[];
  orders: any[];
  API_URL: string;
  headers: any;
}

export function MapLocationTab({ users, kitchens, orders, API_URL, headers }: MapLocationTabProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([26.9124, 75.7873]); // Default center (Jaipur)
  const [routes, setRoutes] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  // Calculate routes for active orders using OSRM
  useEffect(() => {
    if (!isReady) return;

    const fetchRoutes = async () => {
      const activeOrders = orders.filter((o: any) =>
        ['confirmed', 'preparing', 'out_for_delivery'].includes(o.status)
      );

      const newRoutes: any[] = [];
      for (const order of activeOrders) {
        const kitchen = kitchens.find(k => {
          const kitchenId = order.items?.[0]?.menuItem?.cloudKitchen?._id || order.items?.[0]?.menuItem?.cloudKitchen;
          return k._id === kitchenId;
        });

        const customer = users.find(u => u._id === (order.user?._id || order.user));

        if (kitchen?.location?.coordinates && customer?.currentLocation?.latitude) {
          try {
            const start = `${kitchen.location.coordinates[0]},${kitchen.location.coordinates[1]}`;
            const end = `${customer.currentLocation.longitude},${customer.currentLocation.latitude}`;
            const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`);
            const data = await response.json();
            
            if (data.routes?.[0]) {
              newRoutes.push({
                id: order._id,
                coordinates: data.routes[0].geometry.coordinates.map((coord: any) => [coord[1], coord[0]]),
                distance: data.routes[0].distance,
                duration: data.routes[0].duration,
                orderId: order._id,
                kitchenName: kitchen.name,
                customerName: customer.name
              });
            }
          } catch (err) {
            console.error('OSRM Fetch Error:', err);
          }
        }
      }
      setRoutes(newRoutes);
    };

    if (orders.length > 0 && kitchens.length > 0 && users.length > 0) {
      fetchRoutes();
    }
  }, [isReady, orders, kitchens, users]);

  // Filter entities with locations
  const customersWithLocation = users.filter((u: any) =>
    u.role === 'user' && u.currentLocation?.latitude && u.currentLocation?.longitude
  );

  const deliveryPartnersWithLocation = users.filter((u: any) =>
    u.role === 'delivery' && u.currentLocation?.latitude && u.currentLocation?.longitude
  );

  const kitchensWithLocation = kitchens.filter((k: any) =>
    k.location?.coordinates?.[0] && k.location?.coordinates?.[1]
  );

  return (
    <div className="w-full h-[calc(100vh-120px)] bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl relative">
      {isReady && (
        <LiveMap 
          mapCenter={mapCenter}
          routes={routes}
          kitchensWithLocation={kitchensWithLocation}
          customersWithLocation={customersWithLocation}
          deliveryPartnersWithLocation={deliveryPartnersWithLocation}
          orders={orders}
        />
      )}
    </div>
  );
}
