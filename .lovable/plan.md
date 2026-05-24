
## Obiectiv

Redenumirea și extinderea tabului secretariat „Asocieri părinte-copil” într-un tab mai larg „Evidență elevi”, cu trei sub-secțiuni: înscrieri noi, transferuri/plecări și asocieri părinte-copil. Doar mock data, fără backend.

## Modificări

### 1. `src/routes/_authenticated.secretariat.tsx`
- În array-ul `tabs`, schimbă label-ul ultimului tab din `"Asocieri părinte-copil"` în `"Evidență elevi"` (path-ul `/secretariat/asocieri` rămâne pentru a evita refacerea routing-ului).

### 2. `src/lib/mock-data.ts`
Adaugă două tipuri și seturi noi de mock data lângă `asocieriDePerfectat`:
- `InscriereNoua` (id, parinte, elev, cnpElev, clasa, data, status: „În așteptare”) — 2 rânduri (Sofia Mureșan, Tudor Cristea).
- `TransferPlecare` (id, elev, clasa, parinte, motiv: „Transfer” | „Retragere”, institutieDestinatara?, data, status) — 2 rânduri (Andrei Popescu transfer, Radu Ionescu retragere).

`asocieriDePerfectat` rămâne pentru sub-secțiunea 3.

### 3. `src/components/dashboard/status-badge.tsx`
Adaugă în `map` două statusuri noi necesare:
- `"Confirmat"` → stil success
- `"Respins"` → stil destructive

(„În așteptare”, „În verificare”, „Necesită completări” există deja.)

### 4. `src/routes/_authenticated.secretariat.asocieri.tsx` (rescris)
Devine pagina „Evidență elevi”:

**Antet (în interiorul paginii, deasupra tabelelor):**
- Titlu: „Evidență elevi”
- Subtitlu: „Gestionează solicitările de înscriere, transfer și asociere pentru elevii Liceului Teoretic Onisifor Ghibu.”
- Notă informativă (Alert / mic card cu border-warning sau border-muted, iconiță `Info`): „Secretariatul confirmă doar datele aflate în evidența școlii. Relația legală părinte-copil poate necesita documente justificative sau verificări suplimentare.”

**Sub-tabs (componenta `Tabs` din `@/components/ui/tabs`)** cu 3 trigger-uri:
1. „Înscrieri noi”
2. „Transferuri / plecări”
3. „Asocieri părinte-copil”

Fiecare `TabsContent` conține un `Card` cu același `Table` ca acum.

**Tab 1 — Înscrieri noi**
- Coloane: Părinte / tutore, Elev, CNP elev (mono), Clasa, Data solicitării, Status (`StatusBadge`), Acțiune.
- State local pentru a ascunde rândul după acțiune.
- Acțiuni per rând:
  - „Confirmă înscrierea” (primary) → toast.success „Înscriere confirmată.”
  - „Respinge” (outline) → toast.error „Solicitarea a fost respinsă.”

**Tab 2 — Transferuri / plecări**
- Coloane: Elev, Clasa, Părinte / tutore, Motiv, Instituție destinatară (sau „—”), Data solicitării, Status, Acțiune.
- Acțiuni condiționate de `motiv`:
  - Pentru `Transfer`: „Aprobă transfer” + „Cere completări” + „Respinge”.
  - Pentru `Retragere`: „Confirmă plecarea” + „Cere completări” + „Respinge”.
- Toast-uri:
  - Aprobă transfer → „Transferul a fost aprobat.”
  - Confirmă plecarea → „Plecarea a fost confirmată.”
  - Respinge → „Solicitarea a fost respinsă.”
- „Cere completări” deschide un `Dialog`:
  - Title: „Cere completări”
  - `Textarea` cu label „Mesaj către părinte/tutore”
  - Buton „Trimite solicitarea” → închide modal + toast „Solicitare de completări trimisă.”

**Tab 3 — Asocieri părinte-copil**
- Mic paragraf descriptiv deasupra tabelului: „Confirmă că elevul este înscris la această unitate de învățământ și că solicitantul poate gestiona cererile pentru elev.”
- Coloane: Părinte / tutore, Elev, CNP elev (mono), Clasa, Data solicitării, Status, Acțiune.
  (Sursa: `asocieriDePerfectat` — adaug status „În așteptare” derivat în render.)
- Acțiuni:
  - „Confirmă asocierea” → toast.success „Asociere confirmată.”
  - „Respinge” → toast.error „Asociere respinsă.”

## Note de implementare

- CNP rămâne mascat (folosit ca în mock-data, ex. `6•••••••••••11`).
- Tot textul în română.
- Stilul de tabel, card, badge, button rămâne identic cu restul secretariat-ului.
- Path-ul `/secretariat/asocieri` rămâne neschimbat pentru a evita modificări de routing; doar conținutul și label-ul tabului se schimbă.
- Fără API/DB; state local cu `useState` pentru a marca rândurile procesate (ex. ascunse sau cu badge actualizat).
