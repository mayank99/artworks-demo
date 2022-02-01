import styled from '@emotion/styled';
import { Button, Card, CardContent, CardMedia, CircularProgress, Typography } from '@mui/material';
import useSWRInfinite from 'swr/infinite';

type Artwork = { id: string; image_id?: string; title: string; artist_title: string };

export const HomePage = () => {
  return (
    <HomePageWrapper>
      <MaxWidthWrapper>
        <HomePageContent />
      </MaxWidthWrapper>
    </HomePageWrapper>
  );
};

const HomePageContent = () => {
  const getImages = async (url: string) => {
    const response = await fetch(url).then((res) => res.json());
    return response.data as Array<Artwork>;
  };
  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    (_page) => `https://api.artic.edu/api/v1/artworks?page=${_page + 1}`,
    getImages
  );

  const isInitialLoading = isValidating && size === 1;
  const isSubsequentLoading = isValidating && size > 1;

  if (error) return <div>Something went wrong 🙁</div>;

  if (isInitialLoading) return <CircularProgress />;

  return (
    <>
      <CardGrid>
        {data &&
          data.flat().map(({ id, image_id, title, artist_title }, index) => (
            <Card key={id} sx={{ cursor: 'pointer' }}>
              {image_id && (
                <CardMedia
                  component='img'
                  image={`https://www.artic.edu/iiif/2/${image_id}/full/843,/0/default.jpg`}
                  alt=''
                  height={200}
                />
              )}
              <CardContent>
                <Typography
                  gutterBottom
                  variant='h5'
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
            </Card>
          ))}
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
    </>
  );
};

const HomePageWrapper = styled.main`
  min-height: 100vh;
  padding: 4rem;
  display: grid;
  place-items: center;
`;

const MaxWidthWrapper = styled.div`
  max-width: 1000px;
  display: grid;
  place-items: center;
  gap: 2rem;
`;

const CardGrid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
`;
