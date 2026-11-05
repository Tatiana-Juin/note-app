import * as Device from 'expo-device';
import { Alert, Platform, StyleSheet } from 'react-native';
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

  // FONCTION POUR SUPPRIMER UNE NOTE PAR RAPPORT A L'INDEX 
  async function supprimerNote(indexASupprimer:number){
    const nouvellesTaches = taches.filter(
      (_,index) =>index !== indexASupprimer
    );
    const enregistre = await sauvegarder(CLE_TACHES,nouvellesTaches)

    if(!enregistre) {
      console.log('La sauvegarde après suppression a échoué');
      return;
    }
    setTaches(nouvellesTaches);
    // const notesStockees = await lire<string[]>(CLE_TACHES,[])
    // console.log('Notes actuellement enregistrées :', notesStockees);
  }
  // POUR DEMANDER LA CONFIRMATION 
  function demanderConfirmation(index: number) {
    // message a afficher 
    const message = `Voulez-vous vraiment supprimer « ${taches[index]} » ?`;
    // si c'est sur pc on utilise globalThis pour supprimer 
    if (Platform.OS === 'web') {
      if (globalThis.confirm(message)) {
        // recupere pas le resultat
        void supprimerNote(index);
      }
      return;
    }
    // Pour afficher une boite de dialogue Alert.alert sur telephone 
    Alert.alert('Supprimer la note ?', message, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        // void => on veux pas que ca retourne quelque chose 
        onPress: () => {
          void supprimerNote(index);
        },
      },
    ]);
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
                {/* POUR SUPPRIMER UNE NOTE TACHE  */}
                <Pressable
                  onPress={() => demanderConfirmation(index)}
                  style={[styles.button, styles.primary]}
                  accessibilityRole="button"
                  accessibilityLabel="Supprimer une note "
                >
                  <ThemedText style={styles.text}>Supprimer</ThemedText>
                </Pressable>
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
