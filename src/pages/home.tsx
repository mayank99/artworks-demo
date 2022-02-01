import * as React from 'react';
import styled from '@emotion/styled';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  debounce,
  Dialog,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import useSWRInfinite from 'swr/infinite';
import SvgSearch from '@mui/icons-material/Search';
import SvgClear from '@mui/icons-material/Clear';

type Artwork = {
  id: string;
  image_id?: string;
  title: string;
  artist_title: string;
  category_titles?: string[];
  category_ids?: string[];
};

// same as above
const ARTWORK_FIELDS = 'id,image_id,title,artist_title,category_titles,category_ids' as const;

const BASE_URL = 'https://api.artic.edu/api/v1';

const HomePageContext = React.createContext<{ search: string; setSearch: (_: string) => void } | undefined>(undefined);
const useHomePageContext = () => {
  const context = React.useContext(HomePageContext);
  if (!context) throw new Error('HomePageContext not found');
  return context;
};

export const HomePage = () => {
  const [search, setSearch] = React.useState('');

  return (
    <HomePageWrapper>
      <HomePageContext.Provider value={{ search, setSearch }}>
        <HomePageHeader />
        <Main>
          <HomePageContent />
        </Main>
      </HomePageContext.Provider>
    </HomePageWrapper>
  );
};

const HomePageHeader = () => {
  const { search, setSearch } = useHomePageContext();
  const [inputValue, setInputValue] = React.useState(search);

  const debouncedSearch = React.useCallback(debounce((value: string) => setSearch(value), 200), [])

  return (
    <Header>
      <Typography variant='h4' component='div' sx={{ flex: 1, fontStyle: 'italic', textTransform: 'lowercase' }}>
        Artworks
      </Typography>
      <TextField
        variant='outlined'
        size='small'
        placeholder='Search…'
        value={inputValue}
        onChange={({ target: { value } }) => {
          setInputValue(value);
          debouncedSearch(value);
        }}
        InputProps={{
          startAdornment: <SvgSearch sx={{ marginRight: '8px' }} fontSize='small' />,
          endAdornment: (
            <IconButton
              aria-label='Clear'
              size='small'
              sx={{ visibility: search ? 'visible' : 'hidden' }}
              onClick={() => {
                setInputValue(''); 
                setSearch('');
              }}
            >
              <SvgClear fontSize='small' />
            </IconButton>
          ),
        }}
        sx={{ flex: 1, minWidth: 300, maxWidth: 500 }}
      />
    </Header>
  );
};

const HomePageContent = () => {
  const { search } = useHomePageContext();
  const [openArtwork, setOpenArtwork] = React.useState<Artwork>();

  const getUrl = React.useCallback(
    (_page: number) => {
      const endpoint = `${BASE_URL}/artworks/${search && 'search'}`;
      const params = new URLSearchParams({ fields: ARTWORK_FIELDS, page: `${_page + 1}`, q: search });
      return `${endpoint}?${params.toString()}`;
    },
    [search]
  );

  const getImages = React.useCallback(async (url: string) => {
    const response = await fetch(url).then((res) => res.json());
    return response.data as Array<Artwork>;
  }, []);

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getUrl, getImages, { revalidateOnFocus: false });

  const isInitialLoading = isValidating && size === 1;
  const isSubsequentLoading = isValidating && size > 1;

  if (error) return <div>Something went wrong 🙁</div>;

  if ((!isValidating && (data?.flat().length ?? 0) === 0)) return <div>No artworks found</div>;

  if (isInitialLoading) return <CircularProgress />;

  return (
    <>
      <CardGrid>
        {data &&
          data.flat().map((artwork) => {
            const { id, image_id, title, artist_title, category_titles, category_ids } = artwork;
            return image_id ? (
              <CardWrapper
                key={id}
                tabIndex={0}
                onClick={() => setOpenArtwork(artwork)}
                onKeyDown={({ key }) => {
                  if (key === 'Enter' || key === ' ') setOpenArtwork(artwork);
                }}
              >
                <CardImageWrapper>
                  <CardMedia
                    component='img'
                    image={`https://www.artic.edu/iiif/2/${image_id}/full/843,/0/default.jpg`} // see https://api.artic.edu/docs/#iiif-image-api
                    alt={`${artwork.title} by  ${artwork.image_id}`}
                    height={200}
                  />
                </CardImageWrapper>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant='h6'
                    component='div'
                    sx={{
                      WebkitLineClamp: '3',
                      WebkitBoxOrient: 'vertical',
                      display: '-webkit-box',
                      overflow: 'hidden',
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {artist_title}
                  </Typography>
                </CardContent>

                <CardActions>
                  <ChipsWrapper>
                    {category_titles?.map((category, index) => {
                      const categoryId = category_ids?.[index];
                      return (
                        <Chip
                          key={categoryId}
                          label={category}
                          variant={'outlined'}
                          sx={{ fontSize: '0.7rem', height: '1.5rem' }}
                        />
                      );
                    })}
                  </ChipsWrapper>
                </CardActions>
              </CardWrapper>
            ) : null;
          })}
      </CardGrid>

      {!isInitialLoading && (
        <Button
          disabled={isSubsequentLoading}
          onClick={() => setSize((old) => old + 1)}
          sx={{ display: 'flex', gap: '0.5rem' }}
        >
          Load more
          {isSubsequentLoading && <CircularProgress size='1rem' />}
        </Button>
      )}

      {openArtwork !== undefined && <ArtworkModal artwork={openArtwork} onClose={() => setOpenArtwork(undefined)} />}
    </>
  );
};

const ArtworkModal = ({ artwork, onClose }: { artwork: Artwork; onClose: () => void }) => {
  return (
    <Dialog open onClose={onClose}>
      <Card>
        <CardMedia
          component='img'
          image={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`} // see https://api.artic.edu/docs/#iiif-image-api
          alt={`${artwork.title} by  ${artwork.image_id}`}
        />
      </Card>
    </Dialog>
  );
};

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
`;

const Main = styled.main`
  display: grid;
  gap: 2rem;
  place-items: center;
  grid-template-rows: 1fr auto;
`;

const HomePageWrapper = styled.div`
  min-height: 100vh;
  padding: 2rem 4rem;
  width: min(100%, 1000px);
  display: grid;
  gap: 2rem;
  grid-template-rows: auto 1fr;
`;

const CardGrid = styled.div`
  width: 100%;
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
`;

const CardImageWrapper = styled.div`
  overflow: hidden;
`;

const CardWrapper = styled(Card)`
  display: flex;
  flex-direction: column;
  cursor: pointer;

  img {
    transition: transform 0.5s;
    will-change: transform;
  }

  &:hover,
  &:focus-visible {
    img {
      transform: scale(1.1);
    }
  }
`;

const ChipsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.25rem;
  pointer-events: none;
`;
