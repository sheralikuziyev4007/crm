import { useState, useEffect, useRef } from "react";
import type { Client, ClientFields, StatusKey } from "../types";
import { LAST_ID_KEY, STORAGE_KEY } from "../utils/constants";
import { idNumber, nextId, seedClients } from "../utils/idGenerator";
import { formatUzPhone } from "../utils/formatPhone";
import { parseClients } from "../utils/parseClients";

function loadClients(): Client[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Битые записи отбрасываются; если пригодных нет совсем — демо-данные
    const list = saved === null ? seedClients() : (parseClients(JSON.parse(saved)) ?? seedClients());
    // Приводим ранее сохранённые номера телефонов к единому формату
    return list.map((c) => ({ ...c, phone: formatUzPhone(c.phone) }));
  } catch {
    return seedClients();
  }
}

function loadLastIssued(): number {
  try {
    const n = Number(localStorage.getItem(LAST_ID_KEY));
    return Number.isInteger(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>(loadClients);
  // Последний выданный номер id живёт в ref: два добавления подряд не получат одинаковый id
  const lastIssued = useRef<number | null>(null);
  if (lastIssued.current === null) lastIssued.current = loadLastIssued();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch {
      // localStorage недоступен — молча игнорируем
    }
  }, [clients]);

  const addClient = (fields: ClientFields) => {
    const id = nextId(clients, lastIssued.current ?? 0);
    lastIssued.current = idNumber(id);
    try {
      localStorage.setItem(LAST_ID_KEY, String(lastIssued.current));
    } catch {
      // не критично: в пределах сессии номер хранится в ref
    }
    setClients((cs) => [...cs, { id, ...fields, createdAt: Date.now() }]);
  };

  const updateClient = (id: string, fields: Partial<ClientFields>) => {
    setClients((cs) => cs.map((c) => (c.id === id ? { ...c, ...fields } : c)));
  };

  const deleteClient = (id: string) => {
    setClients((cs) => cs.filter((c) => c.id !== id));
  };

  const updateStatus = (id: string, status: StatusKey) => {
    setClients((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  return { clients, addClient, updateClient, deleteClient, updateStatus };
}
