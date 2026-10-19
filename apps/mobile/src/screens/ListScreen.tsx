import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import type { AddItem } from '@grocs/application';
import { visibleItems, weekIdFor } from '@grocs/core';
import type { Item } from '@grocs/core';
import { Button, ItemRow, Text, TextField, tokens } from '@grocs/ui';
import type { App } from '../composition/compose-app.ts';

export interface ListScreenProps {
  app: App;
  kitchenId: string;
}

/** The week's grocery list with an add bar (R10). One screen, all state from the app facade. */
export function ListScreen({ app, kitchenId }: ListScreenProps) {
  const weekId = useMemo(() => weekIdFor(app.now()), [app]);
  const [items, setItems] = useState<readonly Item[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [problem, setProblem] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(
    () =>
      app.watchWeekItems(
        kitchenId,
        weekId,
        (next) => setItems(next),
        (error) => setLoadError(error.message),
      ),
    [app, kitchenId, weekId],
  );

  const submit = async () => {
    setBusy(true);
    setProblem(undefined);
    const command: AddItem = { type: 'AddItem', kitchenId, weekId, name };
    const result = await app.dispatch(command);
    setBusy(false);
    if (result.ok) setName('');
    else setProblem(result.error.code === 'empty-name' ? 'Type what to buy first' : 'Could not add that item');
  };

  const rows = visibleItems({ weekId, items: Object.fromEntries(items.map((i) => [i.id, i])) });

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.surfaceCanvas }}>
      <ScrollView contentContainerStyle={{ padding: tokens.space[12], gap: tokens.space[4] }}>
        <Text variant="title">Groceries - {weekId}</Text>
        {loadError ? <Text variant="muted">Could not load the list: {loadError}</Text> : null}
        {rows.length === 0 && !loadError ? <Text variant="muted">Nothing on the list yet</Text> : null}
        {rows.map((item) => (
          <ItemRow key={item.id} name={item.name.value} amount={item.amount.value} inCart={item.state.value === 'in-cart'} />
        ))}
      </ScrollView>
      <View style={{ padding: tokens.space[12], gap: tokens.space[8], flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <TextField
            label="Add an item"
            value={name}
            onChangeText={setName}
            onSubmit={() => void submit()}
            {...(problem !== undefined ? { errorMessage: problem } : {})}
          />
        </View>
        <Button label="Add" loading={busy} onPress={() => void submit()} />
      </View>
    </View>
  );
}
