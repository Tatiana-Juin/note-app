import AsyncStorage from '@react-native-async-storage/async-storage';
// Ajouter une notes 
export const sauvegarder = async (cle:string,valeur: string[])=>{
    try{
        // setItem => ajout 
        const json = await AsyncStorage.setItem(cle,JSON.stringify(valeur));
        return true;
    }catch (error){
        console.log(`Erreur ${cle}`,error);
        return false;
    }
}
// Pour lire une donnée 
export const lire = async <T>(
  cle: string,
  valeurParDefaut: T
): Promise<T> => {
  try {
    const json = await AsyncStorage.getItem(cle);
    return json !== null ? JSON.parse(json) as T : valeurParDefaut;
  } catch (error) {
    console.log(`Erreur de lecture ${cle}`, error);
    return valeurParDefaut;
  }
};

// Pour supprimer 
export const supprimer= async (cle:string) =>{
    try{
        await AsyncStorage.removeItem(cle);
        return true;
    }catch(error){
        console.log(`erreur de suppression`,error);
        
    }
}

