"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [availableNumbers, setAvailableNumbers] = useState(
    Array.from({ length: 400 }, (_, i) => ({
      number: i + 6001,
      available: true
    }))
  );
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [searchNumber, setSearchNumber] = useState('');
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleNumberSelect = (number) => {
    if (availableNumbers[number - 6001].available) {
      if (selectedNumbers.includes(number)) {
        setSelectedNumbers(selectedNumbers.filter(n => n !== number));
      } else {
        setSelectedNumbers([...selectedNumbers, number]);
      }
    }
  };

  const handleFormSubmit = () => {
    if (!formData.name || !formData.phone || !formData.email) {
      alert('Por favor llena los campos obligatorios');
      return;
    }
    setShowPaymentInfo(true);
  };

  const filteredNumbers = availableNumbers.filter(num => 
    num.number.toString().includes(searchNumber)
  );

  const totalAmount = selectedNumbers.length * 100;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-primary mb-2">Peregrinos de Esperanza</h1>
            <CardDescription className="text-lg">Rifa entre amigos</CardDescription>
          </div>
          <div className="bg-primary/10 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold mb-2">¡Gran Premio!</h2>
            <p className="font-medium">MacBook Air 13"</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>📅 Fecha del sorteo: 13 de julio del 2025</p>
              <p>⛪ Lugar: Parroquia de la Sagrada Familia</p>
              <p>🕐 Hora: Después de la misa de 1:00 PM</p>
              <p>📱 Transmisión en vivo a través de <a href="https://www.facebook.com/share/153xWPzvta/?mibextid=wwXIfr" target="_blank" className="text-primary hover:underline underline">la página de Facebook de la parroquia</a></p>
              <p>💰 Donativo por número: $100.00 MXN</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              type="number"
              placeholder="Buscar número... (ej: 6001)"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {filteredNumbers.map(({ number, available }) => (
              <Button
                key={number}
                onClick={() => handleNumberSelect(number)}
                disabled={!available}
                variant={selectedNumbers.includes(number) ? "default" : available ? "outline" : "ghost"}
                className={`h-12 text-sm ${!available ? 'bg-gray-100' : ''} ${
                  selectedNumbers.includes(number) ? 'ring-2 ring-primary' : ''
                }`}
              >
                {number}
              </Button>
            ))}
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-200"></div>
              <span className="text-sm">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100"></div>
              <span className="text-sm">Vendido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary"></div>
              <span className="text-sm">Seleccionado</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {selectedNumbers.length > 0 && !showPaymentInfo && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Tus números seleccionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="font-medium">Números: {selectedNumbers.join(', ')}</p>
              <p className="font-medium">Total a donar: ${totalAmount}.00 MXN</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre completo *</Label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input 
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Dirección (opcional)</Label>
                <Input 
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <Button onClick={handleFormSubmit} className="w-full">
                Continuar al pago
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showPaymentInfo && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Información de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Resumen de tu selección:</p>
                    <p>Números seleccionados: {selectedNumbers.join(', ')}</p>
                    <p className="font-medium">Total a donar: ${totalAmount}.00 MXN</p>
                  </div>
                  
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="font-medium mb-2">Realiza tu donativo mediante alguna de estas opciones:</p>
                    
                    <div className="space-y-1 mb-4">
                    <p className="font-medium">Opción 1: <strong>Transferencia bancaria</strong></p>
                      <p>Banco: Banorte</p>
                      <p>Beneficiario: Santiago Adame Alemán</p>
                      <p>Cuenta: 0014797925</p>
                      <p>CLABE: 072180000147979256</p>
                      <p>Tarjeta: 4189 1430 9218 3857</p>
                    </div>

                    <div className="space-y-1">
                    <p className="font-medium">Opción 2: <strong>PayPal</strong></p>
                      <p>Envía tu donativo a: chagoo22@gmail.com</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Pasos siguientes:</p>
                    <ol className="list-decimal ml-4 space-y-2">
                      <li>Realiza tu transferencia por ${totalAmount}.00 MXN</li>
                      <li>Envía tu comprobante por WhatsApp al: +52 56 4417 8896</li>
                      <li>Incluye tu nombre completo en el mensaje y el número o los números que elegiste</li>
                      <li>Recibirás la confirmación de tus números</li>
                    </ol>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            <Button 
              className="mt-4 w-full"
              onClick={() => {
                setShowPaymentInfo(false);
                selectedNumbers.forEach(number => {
                  const newNumbers = [...availableNumbers];
                  newNumbers[number - 6001].available = false;
                  setAvailableNumbers(newNumbers);
                });
                setSelectedNumbers([]);
                setFormData({
                  name: '',
                  phone: '',
                  email: '',
                  address: ''
                });
              }}
            >
              Confirmar Selección
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
