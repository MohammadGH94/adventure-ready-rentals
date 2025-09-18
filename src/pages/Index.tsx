import { ScrollView, StyleSheet, View } from "react-native";

import Categories from "../components/Categories";
import FeaturedGear from "../components/FeaturedGear";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import colors from "../theme/colors";

const Index = () => (
  <View style={styles.wrapper}>
    <Header />
    <ScrollView contentContainerStyle={styles.content}>
      <Hero />
      <Categories />
      <FeaturedGear />
      <Footer />
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
    gap: 24,
  },
});

export default Index;
