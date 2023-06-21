import { Text, View, TouchableOpacity, StyleSheet, Image, Touchable, Pressable } from "react-native";
import { NavigationBarStyling } from "../Styles/NavigationBar";
import { ButtonStyling } from "../Styles/ButtonStyling";
import Icon from "react-native-vector-icons/FontAwesome";
import IconMCI from "react-native-vector-icons/MaterialCommunityIcons";
import IconMI from "react-native-vector-icons/MaterialIcons";
import { useContext, useEffect, useState, useRef } from "react";
import { AppContext } from "../Interfaces/AppContext";
import { AppContextProvider, ModalType } from "../App";
import SelectDropdown from 'react-native-select-dropdown'
import { CategoryRow, TodoRow, fetchCategories } from "../Auth/supabase";
import { COLOR_BACKGROUND, COLOR_BACKGROUND_A1, COLOR_BACKGROUND_A2, COLOR_MAIN, COLOR_MAIN_40, COLOR_TEXT, executeErrorAction } from "../Modules/InternalModule";
import { FetchOptions } from "../Interfaces/FetchOptions";
import { SkeletonContainer } from "react-native-dynamic-skeletons";
import Animated, { FadeInDown } from "react-native-reanimated";

export type SortingItem = {
  name: string;
  sort: string,
  type: string;
}

export const sortingOptions: SortingItem[] = [
  {
    name: "Deadline (Old to new)",
    sort: "deadline",
    type: "ASC"
  },
  {
    name: "Deadline (New to old)",
    sort: "deadline",
    type: "DESC"
  },
  {
    name: "Important",
    sort: "important",
    type: "ASC"
  },
  {
    name: "Creation date (Old to new)",
    sort: "date",
    type: "ASC"
  },
  {
    name: "Creation date (New to old)",
    sort: "date",
    type: "DESC"
  },
]

const NavigationBar = ({ getTodos }: { getTodos: (options?: FetchOptions) => Promise<string | null> }) => {
  const appContext = useContext<AppContext | null>(AppContextProvider);
  const [localCategories, localCategoriesSet] = useState<string[] | null>()
  const [categoriesList, categoriesListSet] = useState<CategoryRow[] | null>()
  const [localOptions, localOptionsSet] = useState<FetchOptions>(appContext?.fetchingOptions!)
  const [selectedCategory, selectedCategorySet] = useState<CategoryRow | null>()
  const dropDownRef = useRef<SelectDropdown>(null)

  async function getCategories() {
    if (!appContext)
      throw new Error("AppContext is null. This is likely an app bug. Please restart and contact developer.")

    await fetchCategories().then(res => {
      if (res.error) {
        executeErrorAction(appContext, { content: "Error while fetching categories: \n" + res.error.message, code: 500, initiator: 'fetchCategories' })
        return;
      }

      const resultCategories = res.data ? res.data : [];
      resultCategories.push({ contained: null, created_at: new Date().toDateString(), id: Number.MAX_SAFE_INTEGER, name: "None", owner: "GLOBAL" })
      resultCategories.push({ contained: null, created_at: new Date().toDateString(), id: Number.MAX_SAFE_INTEGER - 1, name: "🗑️ Archivized", owner: "GLOBAL_ARCHIVE" })

      categoriesListSet(resultCategories)

      let categories: string[] = ["None"];
      resultCategories?.forEach(item => {
        if (!item?.name)
          return;

        if (item?.name === "None")
          return

        categories.push(item?.name)
      })

      categories.push("+ Add new")

      localCategoriesSet(categories)
    })
  }

  useEffect(() => {
    getCategories()
  }, [appContext?.todosList])


  async function refreshTodos() {
    await getTodos(localOptions).then((error) => {
      if (!error) {
        appContext?.appStateSet({ state: 'IDLE' })
      }
    })
  }

  const handleRefresh = async () => {
    appContext?.appStateSet({ state: 'LOADING' })
    setTimeout(async () => {
      await refreshTodos()
    }, 1000)
  }

  const handleDropdownChange = async (item: string, index: number) => {
    if (!localCategories) return;
    if (!categoriesList) return

    let options: FetchOptions;

    if (index === localCategories.length - 1) {
      appContext?.showModalSet(ModalType.CATEGORY_CREATE_PANEL)
      return;
    }

    if (selectedCategory?.name === item)
      return;

    const category = categoriesList?.filter(c => c?.name === item)
    if (!category) return;

    appContext?.appStateSet({ state: 'LOADING' })

    selectedCategorySet(category[0])
    if (category[0]?.owner === "GLOBAL_ARCHIVE") {
      options = { ...localOptions, specificValue: { column: "completed", value: true }, category: null }
      localOptionsSet(options)

      appContext?.fetchingOptionsSet({ ...appContext.fetchingOptions, specificValue: { column: "completed", value: true }, category: category[0]})
      await getTodos(options).then((error) => {
        if (!error) {
          appContext?.appStateSet({ state: 'IDLE' })
        }
      })
      return;
    }

    //selectedCategorySet(category[0])

    options = { ...localOptions, category: category[0], specificValue: { column: "completed", value: false } }

    localOptionsSet(options)

    appContext?.fetchingOptionsSet({ ...appContext.fetchingOptions, category: category[0], specificValue: { column: "completed", value: false } })
    await getTodos(options).then((error) => {
      if (!error) {
        appContext?.appStateSet({ state: 'IDLE' })
      }
    })
  }

  const handleSortingChange = async (item: SortingItem, index: number) => {
    //! Make changing functions here cuz it worked but expo bugged it
    if(!appContext) throw new Error("Appcontext is not available")
    appContext.sortingOptionSet(item)
  }

  const handleAvatarPress = async () => {
    if(!appContext) throw new Error("Appcontext is not available")
    appContext.showModalSet(ModalType.APP_SETTINGS)
  }

  const getIconName = (item: any) => {
    return item.sort === "deadline" ?
      item.type === "ASC" ? "sort-clock-ascending" : "sort-clock-descending"
    :
    item.sort === "important" ?
      "sort-numeric-variant"
    :
    item.sort === "date" ?
      item.type === "ASC" ? "sort-calendar-ascending" : "sort-calendar-descending"
    :
    "null"
  }

  const NavigationBarStylingReference = NavigationBarStyling(COLOR_MAIN, COLOR_MAIN_40)
  return (
    <View style={NavigationBarStylingReference.nav}>
      <View style={NavigationBarStylingReference.content}>
        <Text style={NavigationBarStylingReference.text}>workorganiser</Text>
        <View style={{display: "flex", flexDirection: "row", alignItems: "center", gap: 5}}>
          <Text style={NavigationBarStylingReference.descriptionItemText}><Icon name="list-ul"></Icon> Active todos: 
          </Text>
          {appContext?.todosList && <Animated.Text entering={FadeInDown.duration(1000)} style={NavigationBarStylingReference.specialText}>
              {appContext?.todosList?.filter(p => !p.completed).length}
            </Animated.Text> }
        </View>
        {appContext?.userData ? 
          <Pressable onPress={handleAvatarPress} style={{position: "absolute", right: 30, top: 25}}><Image source={{uri: appContext?.userData?.avatarUrl}} style={{width: 50, height: 50, borderRadius: 100, borderWidth: 1, borderColor: COLOR_MAIN}}/></Pressable>
          :
          <SkeletonContainer isLoading={true} colors={[COLOR_BACKGROUND, COLOR_BACKGROUND_A2, COLOR_BACKGROUND]} style={{backgroundColor: COLOR_BACKGROUND}} duration={5000}>
            <View style={{width: 50, height: 50, borderRadius: 100, position: "absolute", right: 30, top: 25, borderWidth: 1, borderColor: COLOR_MAIN}}></View>
          </SkeletonContainer>
        }
        <View style={NavigationBarStylingReference.description}>
          <View style={NavigationBarStylingReference.descriptionItem}>
            <Text style={NavigationBarStylingReference.descriptionItemText}><IconMI name="category"></IconMI> Category:</Text>
            {localCategories ? <SelectDropdown ref={dropDownRef} data={localCategories} defaultValue={"None"}
              onSelect={handleDropdownChange} buttonStyle={NavigationBarStylingReference.dropdown} buttonTextStyle={NavigationBarStylingReference.dropdownText} rowTextStyle={NavigationBarStylingReference.dropdownContextText} rowStyle={NavigationBarStylingReference.dropdownContextRow} selectedRowStyle={NavigationBarStylingReference.dropdownContextSelected} dropdownStyle={NavigationBarStylingReference.dropdownContext} buttonTextAfterSelection={(selected) => {
                //! awful
                if (selected === "+ Add new")
                  //@ts-ignore
                  dropDownRef.current?.selectIndex(localCategories?.map((e) => { return e }).indexOf(selectedCategory ? selectedCategory.name : "None"))

                return selected
              }}
              renderCustomizedRowChild={(item, index) => {
                return (
                  <View style={[{ borderWidth: 0, borderColor: "transparent" }]}>
                    <Text style={{
                      color: index === localCategories.length - 1 ? COLOR_MAIN : COLOR_TEXT,
                      textAlign: 'center',
                      borderWidth: 0,
                      fontSize: 18,
                      fontWeight: index === localCategories.length - 1 ? "900" : "300"
                    }}>{item}</Text>
                  </View>
                )
              }} /> 
            :
            <SkeletonContainer isLoading={true} colors={[COLOR_BACKGROUND, COLOR_BACKGROUND_A2, COLOR_BACKGROUND]} style={{backgroundColor: COLOR_BACKGROUND}} duration={2000}>
              <View style={[/*NavigationBarStyling.dropdown,*/ {width: 160, height: 40, borderRadius: 35, borderWidth: 1, borderColor: COLOR_MAIN}]}></View>
            </SkeletonContainer>
            }
          </View>

          <View style={NavigationBarStylingReference.descriptionItem}>
            <Text style={NavigationBarStylingReference.descriptionItemText}><IconMI name="category"></IconMI> Sorting:</Text>
            <SelectDropdown ref={dropDownRef} defaultValue={sortingOptions[2]} data={sortingOptions} /*defaultValue={{name: "New deadline", sort: "deadline", type: "DESC"} as SortingItem} */
              onSelect={handleSortingChange} buttonStyle={[NavigationBarStylingReference.dropdown, {borderColor: COLOR_MAIN}]} buttonTextStyle={NavigationBarStylingReference.dropdownText} rowTextStyle={NavigationBarStylingReference.dropdownContextText} rowStyle={NavigationBarStylingReference.dropdownContextRow} selectedRowStyle={NavigationBarStylingReference.dropdownContextSelected} dropdownStyle={NavigationBarStylingReference.dropdownContext}
              renderCustomizedButtonChild={(item: SortingItem) => {
                return (
                  <View style={[{ borderWidth: 0, borderColor: "transparent" }]}>
                    {item && <Text style={[style.text, { fontSize: 12 }]}><IconMCI color={COLOR_MAIN} size={16} name={getIconName(item)} /> {item.name}</Text>}
                  </View>
                )
              }}
              renderCustomizedRowChild={(item, index) => {
                return (
                  <View style={[{ borderWidth: 0, borderColor: "transparent" }]}>
                    <Text style={[style.text, { fontSize: 12 }]}>
                      <IconMCI color={COLOR_MAIN} size={16} name={
                        getIconName(item)
                      } /> {item.name}
                    </Text>
                  </View>
                )
              }}
            />
          </View>
        </View>
        <View style={NavigationBarStylingReference.description}>
          {/* <TouchableOpacity onPress={handleRefresh} style={[ButtonStyling.button, NavigationBarStyling.button]}>
              <Icon name="refresh" style={ButtonStyling.icon}></Icon><Text style={ButtonStyling.text}>Refresh</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  text: {
    color: COLOR_TEXT,
    textAlign: 'center',
    borderWidth: 0,
    fontSize: 18,
    fontWeight: "300"
  }
})

export default NavigationBar;