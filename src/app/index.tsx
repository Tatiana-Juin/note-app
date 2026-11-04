import * as Device from 'expo-device';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput,Pressable,Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useState,useEffect } from 'react';
import { lire, sauvegarder } from '@/data/storage';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}
const CLE_TACHES = 'taches';
export default function HomeScreen() {
  const theme = useTheme();
  const fieldStyle = {
        backgroundColor: theme.backgroundElement,
        borderColor: theme.textSecondary,
    };
    // pour le nom des notes
  const [name,setName] = useState("");
  // pour les taches
  const [taches,setTaches] = useState<string[]>([]);
  // pour le chargement 
  const [chargement,setChargement] = useState(true);

  // POUR LIRE AU DEMARRAGE LES DONNEE
  useEffect(() =>{
    async function chargerNotes(){
      const notes = await lire<string[]>(CLE_TACHES,[]);
      setTaches(notes);
      setChargement(false);
    }
    chargerNotes();
  },[]);

  // fonction pour les verification pour ajouter une notes 
  async function ajouterNote(){
    const texte = name.trim();
    if(!texte) return;

    const nouvellesTaches = [...taches,texte];
    const enregistre = await sauvegarder(CLE_TACHES,nouvellesTaches)

    if(!enregistre) return;
    setTaches(nouvellesTaches)
    setName('')
  }
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          
          <ThemedText type="title" style={styles.title}>
            Mes notes
          </ThemedText>
          {/* AJOUTER UNE NOTES  */}
          <ThemedView style={styles.inputRow}>
            <TextInput
              style={[styles.input, fieldStyle, { color: theme.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Ex. : apprendre React"
              accessibilityLabel="Note"
            />
            <Pressable
              onPress={ajouterNote}
              style={[styles.button, styles.primary]}
              accessibilityRole="button"
              accessibilityLabel="Ajouter une note"
            >
              <ThemedText style={styles.text}>Ajouter</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>

        {/* POUR AFFICHER LES TACHES   */}
        <ThemedView style={styles.notesList}>
          {taches.length ===0 ?(
            <ThemedText style={{ color: theme.text }}>Aucune note pour le moment</ThemedText>
          ):(
            taches.map((tache,index) =>(
              <ThemedView
                key={`${tache}-${index}`}
                style={[styles.note, { backgroundColor: theme.backgroundElement, borderColor: theme.textSecondary }]}
              >
                <ThemedText style={{ color: theme.text }}>{tache}</ThemedText>
              </ThemedView>
            ))
          )  
          }
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    width: '100%',
    gap: Spacing.three,
  },
  inputRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
   input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  button: {
    minHeight: 52,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
    primary: {
    backgroundColor: '#75609C',
  },
   text: {
    color: 'white',
    fontWeight: 'bold',
  },
  notesList: {
    width: '100%',
    gap: Spacing.two,
  },
  note: {
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: 8,
  },
});
